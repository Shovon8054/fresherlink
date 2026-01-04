import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';

export const getAllUsers = async (req, res) => {
    try {
        // Fetch profiles populated with user info (email, role, followers, etc.)
        const profiles = await Profile.find()
            .populate({
                path: 'userId',
                select: 'email role followers following' // Fields we need from User
            });

        // Filter out profiles where userId might be null (deleted users) if necessary
        const validProfiles = profiles.filter(p => p.userId);

        res.json(validProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const followUser = async (req, res) => {
    try {
        const { id } = req.params; // Target user to follow
        const myId = req.user.id;

        if (id === myId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(id);
        const myUser = await User.findById(myId);

        if (!targetUser || !myUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add to my following if not already there
        if (!myUser.following.includes(id)) {
            myUser.following.push(id);
            await myUser.save();
        }

        // Add to target's followers if not already there
        if (!targetUser.followers.includes(myId)) {
            targetUser.followers.push(myId);
            await targetUser.save();
        }

        // Create notification for target user
        try {
            const { Notification } = await import('../models/Notification.js');
            const { Profile } = await import('../models/profile.js');
            const followerProfile = await Profile.findOne({ userId: myId });
            const followerName = followerProfile ? (followerProfile.name || followerProfile.companyName) : 'Someone';

            await Notification.create({
                recipient: targetUser._id,
                sender: myId,
                message: `${followerName} started following you`,
                type: 'follow'
            });
        } catch (err) {
            console.error('Failed to create follow notification', err.message);
        }

        res.json({ message: "Followed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // Target user to unfollow
        const myId = req.user.id;

        const targetUser = await User.findById(id);
        const myUser = await User.findById(myId);

        if (!targetUser || !myUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove from my following
        myUser.following = myUser.following.filter(uid => uid.toString() !== id);
        await myUser.save();

        // Remove from target's followers
        targetUser.followers = targetUser.followers.filter(uid => uid.toString() !== myId);
        await targetUser.save();

        res.json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
