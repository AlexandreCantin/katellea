import express from 'express';
import Notification from '../models/notification';
import User from '../models/user';
import { injectUserFromToken } from '../middlewares/inject-user-from-token';

const notificationsRoutes = express.Router();
notificationsRoutes.use(injectUserFromToken);

const getLastNotifications = async (req, res) => {
  const notifications = await Notification.find({ forUser: req.userId }).sort({ createdAt: -1 }).limit(10)
    .populate({ path: 'author', model: 'User', select: User.publicFields });

  return res.json(notifications);
};

// Routes
notificationsRoutes.get('', getLastNotifications);

export default notificationsRoutes;
