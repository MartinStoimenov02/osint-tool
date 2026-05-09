import React, { useState } from "react";
import Axios from "axios";
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const DeleteAccountModal = ({ isOpen, onClose, onSuccess, user }) => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const showStatus = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleDelete = async () => {
    if (confirmEmail !== user.email) {
      return showStatus(t('deleteAccount.emailMismatch', "Имейлът не съвпада с вашия!"));
    }

    if (user.hasPassword && !password) {
      return showStatus(t('deleteAccount.passwordRequired', "Моля, въведете парола за потвърждение!"));
    }

    setLoading(true);
    try {
      let res;
      // 1. Проверка на самоличността
      if (user.hasPassword) {
        res = await Axios.post(`${backendUrl}/users/getUser`, {
          email: user.email,
          password: password
        });
      } else {
        res = await Axios.post(`${backendUrl}/users/googleAuth`, { 
          userData: { email: user.email } 
        });
      }

      // 2. Реално изтриване
      if (res.data.success) {
        const deleteRes = await Axios.post(`${backendUrl}/users/deleteAccount`, { 
          userId: user.id 
        });

        if (deleteRes.data.success) {
          onSuccess(); // Logout и Redirect
          onClose();
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      
      const backendError = error.response?.data?.error;

      // Проверка за специфични кодове от getUser/googleAuth или deleteAccount
      if (backendError === 'INVALID_CREDENTIALS') {
          showStatus(t('auth.errors.invalidCredentials', "Невалидна парола!"));
      } else if (backendError === 'ERROR_DELETING_ACCOUNT') {
          showStatus(t('deleteAccount.errors.deleteFailed', "Грешка при изтриване на акаунта."));
      } else if (backendError === 'USER_NOT_FOUND') {
          showStatus(t('auth.errors.userNotFound', "Потребителят не е намерен."));
      } else {
          showStatus(t('deleteAccount.verificationError', "Грешка при верификацията!"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-800 border border-red-900/50 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(220,38,38,0.15)] relative">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={onClose}>
          <FaTimes size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-red-600/20 p-4 rounded-full text-red-500 mb-4">
            <FaExclamationTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {t('deleteAccount.title', 'Изтриване на акаунт')}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {t('deleteAccount.warningText', 'Това действие е необратимо. Всички ваши данни ще бъдат изтрити завинаги.')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              {t('deleteAccount.confirmEmail', 'Потвърдете вашия имейл')}
            </label>
            <input
              type="email"
              placeholder={user.email}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-red-500 transition-all"
            />
          </div>

          {user.hasPassword && (
            <div className="relative">
              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
                {t('deleteAccount.passwordLabel', 'Парола')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('deleteAccount.passwordPlaceholder', 'Вашата парола')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 outline-none focus:border-red-500 transition-all"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />} 
                </button>
              </div>
            </div>
          )}

          {message.text && (
            <div className="p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-400 text-sm text-center font-bold">
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all">
              {t('common.cancel', 'Отказ')}
            </button>
            <button 
              onClick={handleDelete} 
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all"
            >
              {loading ? t('deleteAccount.deleting', 'Изтриване...') : t('deleteAccount.deleteBtn', 'ИЗТРИЙ')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;