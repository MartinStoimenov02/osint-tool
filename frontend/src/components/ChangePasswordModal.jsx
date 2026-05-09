import React, { useState } from "react";
import Axios from "axios";
import { FaEye, FaEyeSlash, FaTimes, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const ChangePasswordModal = ({ isOpen, onClose, email, setChangedPasswordSuccess }) => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage({ text: "", type: "" });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const showStatus = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleChange = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return showStatus(t('changePassword.fillAllFields', "Моля, попълнете всички полета."));
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return showStatus(t('changePassword.passwordRegexError', "Паролата трябва да е поне 8 символа с главна, малка буква и цифра."));
    }

    if (newPassword !== confirmNewPassword) {
      return showStatus(t('changePassword.passwordMismatch', "Новата парола не съвпада!"));
    }

    setLoading(true);
    
    try {
      // 1. Проверка на текущата парола (през getUser)
      // Ако паролата е грешна, Axios ще хвърли грешка (401 Unauthorized)
      const res = await Axios.post(`${backendUrl}/users/getUser`, {
        email: email,
        password: currentPassword
      });

      if (res.data.success) {
        // 2. Реална смяна на паролата
        const resetRes = await Axios.post(`${backendUrl}/users/resetPassword`, {
          email,
          password: newPassword,
        });

        if (resetRes.data.success) {
          setChangedPasswordSuccess(true);
          handleClose();
        }
      }
    } catch (error) {
      console.error("Password change error:", error);
      
      // Взимаме системния код от бекенда
      const backendError = error.response?.data?.error;
      
      if (backendError === 'INVALID_CREDENTIALS') {
          showStatus(t('changePassword.errors.invalidCurrentPassword', "Невалидна текуща парола!"));
      } else if (backendError === 'USER_NOT_FOUND') {
          showStatus(t('auth.errors.userNotFound', "Потребителят не е намерен."));
      } else {
          // Универсалната ни грешка от common обекта
          showStatus(t('common.error', "Възникна неочаквана грешка!"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={handleClose}>
          <FaTimes size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
            <FaLock size={20} />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t('changePassword.title', 'Смяна на парола')}</h2>
        </div>

        <form onSubmit={handleChange} className="space-y-4">
          {/* Текуща парола */}
          <div className="relative">
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">{t('changePassword.currentPassword', 'Текуща парола')}</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 outline-none focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Нова парола */}
          <div className="relative">
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">{t('changePassword.newPassword', 'Нова парола')}</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 outline-none focus:border-blue-500 transition-all"
                placeholder={t('changePassword.newPasswordPlaceholder', 'Поне 8 символа')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Повтори нова парола */}
          <div className="relative">
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">{t('changePassword.confirmPassword', 'Повтори парола')}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 outline-none focus:border-blue-500 transition-all"
                placeholder={t('changePassword.confirmPasswordPlaceholder', 'Повторете новата парола')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold ${message.type === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all">
              {t('common.close', 'Затвори')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all">
              {loading ? t('common.saving', 'Запис...') : t('common.confirm', 'Потвърди')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;