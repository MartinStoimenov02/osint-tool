import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const Notifications = ({ setHasUnreadNotifications }) => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ

  const [notifications, setNotifications] = useState([]);
  
  // ✅ Поправка за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const user = useSelector((state) => state.user.user); 

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(`${backendUrl}/notifications/getNotificationsForUser`, {
            params: { userId: user.id || user._id } // Гарантираме, че хваща правилното ID
          }); 
          
          // Сортираме най-новите първи (ако бекендът не го прави)
          const sortedData = (response.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(sortedData);
          
        } catch (error) {
          const backendError = error.response?.data?.error;
          if (backendError === 'ERROR_FETCHING_NOTIFICATIONS') {
             console.error(t('notifications.errors.fetchFailed', 'Грешка при зареждане на нотификациите'));
          } else {
             console.error('Error fetching notifications:', error);
          }
        }
      };

      fetchNotifications();
    }
  }, [user, backendUrl]);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    // Динамично сменяме локала според избрания език
    const locale = i18n.language === 'bg' ? 'bg-BG' : 'en-US';
    return new Date(date).toLocaleDateString(locale, options);
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.patch(`${backendUrl}/notifications/markAsRead`, {
         notificationId: notificationId
      });
      
      setNotifications((prevNotifications) => {
        const updated = prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );

        // Проверка дали всички са прочетени, за да се обнови червената точка в Header-а
        const allRead = updated.every((n) => n.isRead);
        if (setHasUnreadNotifications) {
           setHasUnreadNotifications(!allRead);
        }

        return updated;
      });
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError === 'NOTIFICATION_NOT_FOUND') {
          console.error(t('notifications.errors.notFound', 'Нотификацията не е намерена.'));
      } else if (backendError === 'ERROR_MARKING_NOTIFICATION_READ') {
          console.error(t('notifications.errors.markReadFailed', 'Грешка при маркиране на съобщението като прочетено.'));
      } else {
          console.error('Error marking notification as read:', error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full">
      {notifications.length > 0 ? (
        <div className="flex flex-col divide-y divide-slate-700/50">
          {notifications.map((notification, index) => (
            <div
              key={notification._id || index}
              className={`p-4 cursor-pointer transition-all duration-200 hover:bg-slate-700/50 flex gap-3 ${
                !notification.isRead ? 'bg-blue-900/10 border-l-2 border-blue-500' : 'bg-transparent border-l-2 border-transparent opacity-70'
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  handleNotificationClick(notification._id);
                }
              }}
            >
              <div className="mt-1">
                {!notification.isRead ? (
                  <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
                ) : (
                  <FaCheckCircle className="text-slate-500 mt-0.5" size={12} />
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                <div className={`text-sm leading-snug ${!notification.isRead ? 'text-white font-bold' : 'text-slate-300 font-normal'}`}>
                  {notification.message}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {formatDate(notification.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center flex flex-col items-center justify-center opacity-50">
          <FaBell className="text-4xl text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('notifications.noNew', 'Нямате нови известия.')}</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;