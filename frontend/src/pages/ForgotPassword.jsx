import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ
import backgroundImage from "../images/photo-1.jpeg";

function ForgotPassword() {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const isAllowed = location.state?.allowed;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    // Ако потребителят се опита да достъпи страницата директно без верификация, го връщаме
    if (!isAllowed || !email) {
      navigate("/login");
    }
  }, [isAllowed, email, navigate]);

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/.test(password);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage({ text: t('forgotPassword.errors.passwordMismatch', "Паролите не съвпадат!"), type: "error" });
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    if (!validatePassword(password)) {
      setMessage({ text: t('forgotPassword.errors.passwordRequirements', "Паролата трябва да съдържа поне 8 символа, главна буква, малка буква и цифра."), type: "error" });
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      const res = await Axios.post(`${backendUrl}/users/resetPassword`, {
        email,
        password,
      });

      if (res.data.success) {
        // Бекендът връща message: "PASSWORD_RESET_SUCCESS"
        setMessage({ text: t('forgotPassword.successMessage', "Паролата е променена успешно! Пренасочване към вход..."), type: "success" });
        setTimeout(() => navigate("/login"), 2000); 
      }
    } catch (error) {
      console.error("error changing password: ", error);
      
      const backendError = error.response?.data?.error;
      
      if (backendError === 'USER_NOT_FOUND') {
          setMessage({ text: t('auth.errors.userNotFound', "Потребителят не е намерен."), type: "error" });
      } else {
          // Fallback към обща грешка за смяна на парола
          setMessage({ text: t('forgotPassword.errors.changeError', "Грешка при промяната на паролата."), type: "error" });
      }
      
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Ако достъпът не е разрешен, не рендираме нищо, докато трае useEffect проверката
  if (!isAllowed || !email) return null;

  return (
    <div className="min-h-screen flex bg-slate-900 relative font-sans">
      
      {/* Лява част: Статична Снимка (по подобие на Login/Signup) */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9)), url(${backgroundImage})` 
        }}
      >
        <div className="h-full flex flex-col justify-center px-12 text-white">
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">{t('forgotPassword.title', 'Възстановяване на достъпа')}</h2>
          <p className="text-xl text-slate-300">{t('forgotPassword.subtitle', 'Задайте нова сигурна парола за вашия акаунт, за да продължите работа.')}</p>
        </div>
      </div>

      {/* Дясна част: Форма (по подобие на Login/Signup) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          
          <div className="flex justify-center mb-6">
             <div className="bg-slate-900 p-4 rounded-full border border-slate-700 shadow-inner">
                <FaKey className="text-blue-500 text-3xl" />
             </div>
          </div>

          <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-widest">{t('forgotPassword.newPasswordTitle', 'Нова парола')}</h2>
          <p className="text-center text-slate-400 mb-8">{t('forgotPassword.changingForAccount', 'Промяна на паролата за акаунт:')} <span className="text-blue-400 font-bold break-all">{email}</span></p>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            
            <div className="relative">
              <label className="block text-slate-400 text-sm font-bold mb-2">{t('forgotPassword.newPasswordLabel', 'Нова Парола')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t('forgotPassword.newPasswordPlaceholder', 'Въведете новата парола')} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-slate-400 text-sm font-bold mb-2">{t('forgotPassword.confirmPasswordLabel', 'Потвърдете Паролата')}</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder={t('forgotPassword.confirmPasswordPlaceholder', 'Потвърдете новата парола')} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all mt-4 disabled:opacity-50"
            >
              {loading ? t('common.processing', 'Обработка...') : t('forgotPassword.changePasswordBtn', 'Смени паролата')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;