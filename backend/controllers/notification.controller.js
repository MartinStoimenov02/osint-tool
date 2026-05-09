const NotificationModel = require('../models/notification.model.js');
const UserNotificationModel = require('../models/userNotification.model.js');
const UserModel = require('../models/user.model.js');
const logError = require('../utils/logger.js');

exports.addNotification = async (req, res, next) => {
  const { message, adminId } = req.body;

  try {
    const user = await UserModel.findById(adminId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
      });
    }

    const newNotification = new NotificationModel({ message });
    await newNotification.save();

    res.status(201).json({
      success: true,
      message: 'NOTIFICATION_ADDED',
      data: newNotification
    });
  } catch (err) {
    next(err);
    logError(err, req, { className: 'notification.controller', functionName: 'addNotification' });
    console.error("Error adding notification: ", err);
    res.status(500).json({
      success: false,
      error: 'ERROR_ADDING_NOTIFICATION',
    });
  }
};

exports.addUserNotification = async (req, res, next) => {
  const { adminId, userId, notificationId } = req.body;

  try {
    const user = await UserModel.findById(adminId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
      });
    }

    const userNotification = await UserNotificationModel.create({
      user: userId,
      notificationId,
    });

    res.status(201).json({
      success: true,
      message: 'USER_NOTIFICATION_LINKED',
      data: userNotification,
    });
  } catch (error) {
    next(error);
    logError(error, req, { className: 'notification.controller', functionName: 'addUserNotification', user: req.body.userId });
    console.error("Error adding user notification: ", error);
    res.status(500).json({
      success: false,
      error: 'ERROR_ADDING_USER_NOTIFICATION',
    });
  }
};

exports.getNotificationsForUser = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const userNotifications = await UserNotificationModel
      .find({ user: userId })
      .populate('notificationId') 
      .exec();

    const unreadNotifications = userNotifications
      .filter(uns => !uns.isRead && uns.notificationId) 
      .sort((a, b) => new Date(b.notificationId.createdAt) - new Date(a.notificationId.createdAt));

    const readNotifications = userNotifications
      .filter(uns => uns.isRead && uns.notificationId)  
      .sort((a, b) => new Date(b.notificationId.createdAt) - new Date(a.notificationId.createdAt));

    const allNotifications = [...unreadNotifications, ...readNotifications];
    res.status(200).json({
      success: true,
      message: 'NOTIFICATIONS_FETCHED',
      data: allNotifications.map(uns => ({
        _id: uns._id, 
        message: uns.notificationId.message,
        createdAt: uns.notificationId.createdAt,
        isRead: uns.isRead,
      })),
    });
  } catch (err) {
    next(err);
    logError(err, req, { className: 'notification.controller', functionName: 'getNotificationsForUser', user: req.query.userId });
    console.error('Error fetching notifications:', err);
    res.status(500).json({
      success: false,
      error: 'ERROR_FETCHING_NOTIFICATIONS',
    });
  }
};

exports.markAsRead = async (req, res, next) => {
  const { notificationId } = req.body;
  try {
    const userNotification = await UserNotificationModel.findById(notificationId);

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
      });
    }

    userNotification.isRead = true;
    userNotification.readOn = new Date();
    await userNotification.save();

    res.status(200).json({
      success: true,
      message: 'NOTIFICATION_MARKED_READ',
      data: userNotification,
    });
  } catch (err) {
    next(err);
    logError(err, req, { className: 'notification.controller', functionName: 'markAsRead' });
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      success: false,
      error: 'ERROR_MARKING_NOTIFICATION_READ',
    });
  }
};