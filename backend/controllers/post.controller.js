import { Post } from '../models/Post.js';

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
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .populate('author', 'name email') // basic info
            .populate('comments.userId', 'name');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        // Get list of user IDs I am following
        const myUser = req.user; // Usually populate isn't on req.user unless middleware put it there full.
        // However, our auth middleware just decodes token. We might need to fetch the user's following list first.
        // Or, simpler: we assume we can fetch User from DB.

        // Changing approach: fetch clean user to get 'following' array.
        // But wait, our 'User' model was just updated.

        // OPTIMIZATION: If req.user is just { id, role, ... } from JWT, we need to fetch following list.
        // BUT we can use $in query directly if we fetch user first.

        // Import User to fetch following list
        const { User } = await import('../models/User.js');
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const followingIds = user.following || [];

        // Feed = My posts + Following posts
        const posts = await Post.find({
            author: { $in: [...followingIds, req.user.id] }
        })
            .sort({ createdAt: -1 })
            .populate('author', 'name email role') // Show who posted
            .populate('comments.userId', 'name');

        res.json(posts);
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
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
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

        // We might want to return the populated post or just the comments
        const updatedPost = await Post.findById(id).populate('comments.userId', 'name');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
