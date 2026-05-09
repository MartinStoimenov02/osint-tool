import { useState } from "react";
import { useSelector } from 'react-redux';
import Axios from "axios";
import { FaStar, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const FeedbackModal = ({ isOpen, onClose, setIsModalOpenSuccess }) => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ

  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [messageAlert, setMessageAlert] = useState("");
  const [success, setSuccess] = useState(false);
  
  const user = useSelector((state) => state.user.user); 
  
  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setMessageAlert(t('feedbackModal.notLoggedIn', "Потребителят не е логнат."));
      return;
    }

    if (!feedbackType) {
      setMessageAlert(t('feedbackModal.missingType', "Моля, изберете тип обратна връзка!"));
      setTimeout(() => setMessageAlert(""), 3000);
      return;
    }

    if (rating === 0) {
      setMessageAlert(t('feedbackModal.missingRating', "Моля, изберете рейтинг!"));
      setTimeout(() => setMessageAlert(""), 3000);
      return;
    }

    const feedbackData = {
      userId: user.id,
      feedbackType,
      message,
      rating,
    };

    try {
      // Ползваме Axios вместо fetch за автоматичен JWT токен
      const res = await Axios.post(`${backendUrl}/feedback/createFeedback`, feedbackData);

      if (res.data.success) {
        setSuccess(true);
        setIsModalOpenSuccess(true); // Това затваря модала и показва успех в Profile
        onClose();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      const backendError = error.response?.data?.error;

      if (backendError === 'ERROR_CREATING_FEEDBACK') {
          setMessageAlert(t('feedbackModal.errors.createFailed', "Грешка при записването на обратната връзка!"));
      } else {
          // Fallback
          setMessageAlert(t('feedbackModal.submitError', "Грешка при изпращане."));
      }

      setSuccess(false);
      setTimeout(() => setMessageAlert(""), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={onClose}>
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
          {t('feedbackModal.title', 'Обратна връзка')}
        </h2>
        
        <div className="space-y-4">
          {/* Тип фийдбек */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              {t('feedbackModal.messageType', 'Тип на съобщението')}
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-blue-500 transition-all"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
            >
              <option value="" disabled>{t('feedbackModal.options.selectCategory', 'Изберете категория...')}</option>
              <option value="Доклад за грешка">🐛 {t('feedbackModal.options.bugReport', 'Доклад за грешка')}</option>
              <option value="Предложение">💡 {t('feedbackModal.options.suggestion', 'Предложение')}</option>
              <option value="Жалба">⚠️ {t('feedbackModal.options.complaint', 'Жалба')}</option>
              <option value="Обща обратна връзка">💬 {t('feedbackModal.options.general', 'Обща обратна връзка')}</option>
              <option value="Помощ и въпроси">❓ {t('feedbackModal.options.help', 'Помощ и въпроси')}</option>
            </select>
          </div>

          {/* Рейтинг */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              {t('feedbackModal.rating', 'Оценка')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${star <= rating ? "text-yellow-400" : "text-slate-600 hover:text-slate-500"}`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          {/* Съобщение */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              {t('feedbackModal.messageLabel', 'Съобщение')}
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 h-32 resize-none outline-none focus:border-blue-500 transition-all"
              placeholder={t('feedbackModal.messagePlaceholder', 'Напишете вашите впечатления тук...')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          {messageAlert && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold ${success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
              {messageAlert}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all">
              {t('common.cancel', 'Отказ')}
            </button>
            <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all">
              {t('common.send', 'Изпрати')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;