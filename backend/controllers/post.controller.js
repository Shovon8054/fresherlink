import { Post } from '../models/Post.js';
import { Profile } from '../models/profile.js';

// Helper to attach profile name/companyName to author field
const attachAuthorName = async (posts) => {
    const arr = Array.isArray(posts) ? posts : [posts];

    return Promise.all(arr.map(async (p) => {
        const postObj = p.toObject ? p.toObject() : p;
        try {
            const authorId = postObj.author?._id || postObj.author;
            const profile = await Profile.findOne({ userId: authorId });
            if (profile) {
                postObj.author = postObj.author || {};
                postObj.author.name = profile.name || profile.companyName || postObj.author.name;
            }
        } catch (err) {
            // ignore
        }
        return postObj;
    }));
};

export const createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        let mediaUrl = null;
        let mediaType = null;

        if (req.file) {
            mediaUrl = `uploads/posts/${req.file.filename}`;
            // Simple mime type check, or just rely on extension if needed
            // multer gives mimetype (e.g. image/jpeg, video/mp4)
            if (req.file.mimetype.startsWith('image')) {
                mediaType = 'image';
            } else if (req.file.mimetype.startsWith('video')) {
                mediaType = 'video';
            }
        }

        const newPost = new Post({
            author: req.user.id,
            caption,
            mediaUrl,
            mediaType
        });

        await newPost.save();
        const populated = await Post.findById(newPost._id).populate('author', 'email role');
        const [withName] = await attachAuthorName(populated);
        res.status(201).json(withName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .populate('author', 'email role')
            .populate('comments.userId', 'email role');

        // Attach names to authors
        const postsWithNames = await attachAuthorName(posts);

        res.json(postsWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        // Feed = All posts
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate('author', 'email role')
            .populate('comments.userId', 'email role');

        // Attach names to authors
        const postsWithNames = await attachAuthorName(posts);

        res.json(postsWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user.id;
        const index = post.likes.findIndex(l => l.toString() === userId);

        let didLike = false;
        if (index === -1) {
            post.likes.push(userId);
            didLike = true;
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();

        // Create notification if someone liked someone else's post
        if (didLike && post.author.toString() !== userId) {
            try {
                const { Notification } = await import('../models/Notification.js');
                const { Profile } = await import('../models/profile.js');
                const likerProfile = await Profile.findOne({ userId });
                const likerName = likerProfile ? (likerProfile.name || likerProfile.companyName) : 'Someone';

                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    message: `${likerName} liked your post`,
                    type: 'post_like',
                    relatedPost: post._id
                });
            } catch (err) {
                console.error('Failed to create like notification', err.message);
            }
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            userId: req.user.id,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Create notification for post author (if commenter is not author)
        try {
            if (post.author.toString() !== req.user.id) {
                const { Notification } = await import('../models/Notification.js');
                const { Profile } = await import('../models/profile.js');
                const commenterProfile = await Profile.findOne({ userId: req.user.id });
                const commenterName = commenterProfile ? (commenterProfile.name || commenterProfile.companyName) : 'Someone';

                await Notification.create({
                    recipient: post.author,
                    sender: req.user.id,
                    message: `${commenterName} commented on your post`,
                    type: 'post_comment',
                    relatedPost: post._id
                });
            }
        } catch (err) {
            console.error('Failed to create comment notification', err.message);
        }

        // Return the new comment with populated user
        const { Profile } = await import('../models/profile.js');
        const profile = await Profile.findOne({ userId: req.user.id });
        const name = req.user.role === 'company' ? (profile?.companyName || req.user.email) : (profile?.name || req.user.email);
        const photo = profile?.photo || null;
        const commentToReturn = {
            ...newComment,
            userId: {
                _id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                name,
                photo
            }
        };

        res.json({ comment: commentToReturn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { caption } = req.body;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Verify ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (caption !== undefined) post.caption = caption;

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Verify ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(id);
        res.json({ message: 'Post deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
