import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const SendMessageModal = ({ currentUser, selectedUserIds, onClose, onSuccess }) => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Поправка за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleSend = async () => {
    if (!notificationMessage.trim()) {
      setMessage(t('sendMessage.emptyMessageError', "Моля, въведете съобщение!"));
      setSuccess(false);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      // 1. Създаване на глобалната нотификация
      const { data: notifData } = await axios.post(`${backendUrl}/notifications/addNotification`, {
        message: notificationMessage,
        adminId: currentUser.id,
      });
      
      if (!notifData.success) {
        throw new Error('Failed to create notification');
      }

      const notificationId = notifData.data._id; 
      
      // 2. Свързване с всеки избран потребител
      for (const userId of selectedUserIds) {
        await axios.post(`${backendUrl}/notifications/addUserNotification`, {
          adminId: currentUser.id,
          userId: userId,
          notificationId: notificationId,
        });

        // 3. (Опционално) Изпращане по имейл
        if (sendEmail) {
          await axios.post(`${backendUrl}/email/sendNotificationEmail`, {
            adminId: currentUser.id,
            userId: userId,
            notificationMessage: notificationMessage,
          });
        }
      }
      
      onSuccess();
      onClose(); 
    } catch (err) {
      console.error('Error sending notifications:', err);
      
      // Взимаме системния код от бекенда
      const backendError = err.response?.data?.error;

      if (backendError === 'ACCESS_DENIED') {
        setMessage(t('sendMessage.errors.accessDenied', "Достъп отказан! Нямате админски права."));
      } else if (backendError === 'MISSING_FIELDS_OR_USER_NOT_FOUND') {
        setMessage(t('sendMessage.errors.missingFields', "Липсват данни или потребителят не съществува."));
      } else if (backendError === 'ERROR_SENDING_NOTIFICATION') {
        setMessage(t('sendMessage.errors.emailFailed', "Системната нотификация е създадена, но възникна грешка при изпращането на имейла."));
      } else {
        setMessage(t('sendMessage.sendError', "Грешка при изпращане на съобщението!"));
      }
      
      setSuccess(false);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white" 
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
          <FaPaperPlane className="text-blue-500" /> {t('sendMessage.title', 'Изпрати съобщение')}
        </h2>
        <p className="text-slate-400 text-xs font-bold mb-6">
          {t('sendMessage.selectedUsers', 'Избрани потребители:')} {selectedUserIds.length}
        </p>
        
        <div className="space-y-4">
          <textarea
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-4 h-32 resize-none outline-none focus:border-blue-500 transition-all"
            placeholder={t('sendMessage.placeholder', 'Въведи съобщение...')}
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
          />
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <div className="w-5 h-5 bg-slate-900 border-2 border-slate-600 rounded transition-colors peer-checked:bg-blue-500 peer-checked:border-blue-500 group-hover:border-blue-400 flex items-center justify-center">
                {sendEmail && <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>}
              </div>
            </div>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
              {t('sendMessage.sendEmailCheckbox', 'Изпрати и по имейл')}
            </span>
          </label>

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold ${success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button 
              onClick={onClose} 
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              {t('common.cancel', 'Отказ')}
            </button>
            <button 
              onClick={handleSend} 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? t('sendMessage.sending', 'Изпращане...') : <><FaPaperPlane /> {t('common.send', 'Изпрати')}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default SendMessageModal;