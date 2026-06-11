const NotificationModel = require('../models/notification.model.js');
const UserNotificationModel = require('../models/userNotification.model.js');
const UserModel = require('../models/user.model.js');
const logError = require('../utils/logger.js');

exports.addNotification = async (req, res, next) => {
  const { message, adminId } = req.body;

  try {
    const user = await UserModel.findById(adminId);

    // операцията е само за администратори, за това се прави проверка
    if (!user || !user.isAdmin) {
      // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
      });
    }

    // създава се нова нотификация и се записва в базата данни
    const newNotification = new NotificationModel({ message });
    await newNotification.save();

    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
    res.status(201).json({
      success: true,
      message: 'NOTIFICATION_ADDED',
      data: newNotification
    });
  } catch (err) {
    logError(err, req, { className: 'notification.controller', functionName: 'addNotification' });
    console.error("Error adding notification: ", err);
    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
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

    // операцията е само за администратори, за това се прави проверка
    if (!user || !user.isAdmin) {
      // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
      });
    }

    // прави се връзка между създадените нотификации и кои потребители да ги получават
    const userNotification = await UserNotificationModel.create({
      user: userId,
      notificationId,
    });

    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
    res.status(201).json({
      success: true,
      message: 'USER_NOTIFICATION_LINKED',
      data: userNotification,
    });
  } catch (error) {
    next(error);
    logError(error, req, { className: 'notification.controller', functionName: 'addUserNotification', user: req.body.userId });
    console.error("Error adding user notification: ", error);
    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
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
      // взима самото съобщение от колекция Notifications и го вкарва тук
      .populate('notificationId') 
      .exec();

    // сортира непрочетените съобщения по датата им на създаване
    const unreadNotifications = userNotifications
      .filter(uns => !uns.isRead && uns.notificationId) 
      .sort((a, b) => new Date(b.notificationId.createdAt) - new Date(a.notificationId.createdAt));

    // сортира прочетените съобщения по датата им на създаване
    const readNotifications = userNotifications
      .filter(uns => uns.isRead && uns.notificationId)  
      .sort((a, b) => new Date(b.notificationId.createdAt) - new Date(a.notificationId.createdAt));

    // подрежда ги в реда първо непрочетените, после прочетените
    const allNotifications = [...unreadNotifications, ...readNotifications];
    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
    res.status(200).json({
      success: true,
      message: 'NOTIFICATIONS_FETCHED',
      // подава се само това, което е необходимо
      data: allNotifications.map(uns => ({
        _id: uns._id, 
        message: uns.notificationId.message,
        createdAt: uns.notificationId.createdAt,
        isRead: uns.isRead,
      })),
    });
  } catch (err) {
    logError(err, req, { className: 'notification.controller', functionName: 'getNotificationsForUser', user: req.query.userId });
    console.error('Error fetching notifications:', err);
    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
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
      // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
      });
    }

    userNotification.isRead = true;
    userNotification.readOn = new Date();
    await userNotification.save();

    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
    res.status(200).json({
      success: true,
      message: 'NOTIFICATION_MARKED_READ',
      data: userNotification,
    });
  } catch (err) {
    logError(err, req, { className: 'notification.controller', functionName: 'markAsRead' });
    console.error('Error marking notification as read:', err);
    // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
    res.status(500).json({
      success: false,
      error: 'ERROR_MARKING_NOTIFICATION_READ',
    });
  }
};