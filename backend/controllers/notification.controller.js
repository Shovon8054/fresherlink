import { Notification } from '../models/Notification.js';

// Helper to attach profile name to sender
const attachSenderName = async (notifications) => {
    const arr = Array.isArray(notifications) ? notifications : [notifications];
    const { Profile } = await import('../models/profile.js');

    return Promise.all(arr.map(async (n) => {
        const notifObj = n.toObject ? n.toObject() : n;
        try {
            const senderId = notifObj.sender?._id || notifObj.sender;
            if (senderId) {
                const profile = await Profile.findOne({ userId: senderId });
                if (profile) {
                    notifObj.sender = notifObj.sender || {};
                    notifObj.sender.name = profile.name || profile.companyName || notifObj.sender.name;
                }
            }
        } catch (err) {
            // ignore
        }
        return notifObj;
    }));
};

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'email role')
            .populate('relatedJob', 'title')
            .populate('relatedPost', 'caption'); // Add relatedPost population

        const notificationsWithNames = await attachSenderName(notifications);

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.json({ notifications: notificationsWithNames, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};