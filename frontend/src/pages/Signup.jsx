import React, { useState } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/userSlice';
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ
import backgroundImage from "../images/photo-3.jpeg";

function Signup() {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State за модалите
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  // --- НОВО: State за модала "Изчакване на одобрение" ---
  const [showPendingModal, setShowPendingModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Използваме променливата от .env за бекенда (нагласена на http://localhost:5000)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Фронтенд Валидация
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;
    const phoneRegex = /^[0-9+/]+$/;

    if (!passwordRegex.test(formData.password)) {
      showMessage(t('changePassword.passwordRegexError', "Паролата трябва да е поне 8 символа с главна, малка буква и цифра."));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage(t('changePassword.passwordMismatch', "Паролите не съвпадат."));
      return;
    }

    const digitCount = formData.phoneNumber.replace(/\D/g, "").length;
    if (!phoneRegex.test(formData.phoneNumber) || digitCount < 10) {
      showMessage(t('profile.errors.invalidPhone', "Телефонният номер трябва да съдържа поне 10 цифри."));
      return;
    }

    setLoading(true);

    try {
      // 2. Бекенд валидация
      const validationRes = await Axios.post(`${backendUrl}/users/validateUser`, formData);
      
      // ВЕЧЕ НЕ ПОЛЗВАМЕ validationRes.data.message директно за текст
      if (!validationRes.data.success) {
        // Използваме универсалната грешка за невалидни данни
        showMessage(t('profile.errors.invalidField', "Невалидни данни."));
        setLoading(false);
        return;
      }

      // 3. Пращане на код за верификация
      await Axios.post(`${backendUrl}/email/sendVerificationCode`, { email: formData.email });
      
      showMessage(t('signup.codeSentMessage', "Имейл с код за верификация е изпратен."), "success");
      setShowModal(true);
    } catch (error) {
        const backendError = error.response?.data?.error;

        if (backendError === 'EMAIL_ALREADY_EXISTS') {
            showMessage(t('auth.errors.emailExists', "Този имейл вече е регистриран!"));
        } else if (backendError === 'PHONE_ALREADY_EXISTS') {
            showMessage(t('auth.errors.phoneExists', "Този телефон вече е регистриран!"));
        } else if (backendError === 'ERROR_SENDING_CODE') {
            showMessage(t('login.sendCodeError', "Грешка при изпращане на кода."));
        } else {
            showMessage(t('signup.networkError', "Възникна грешка!"));
        }
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    setLoading(true);
    try {
      const res = await Axios.post(`${backendUrl}/email/verifyCode`, {
        email: formData.email,
        code: verificationCode,
      });

      if (res.data.success) {
        await Axios.post(`${backendUrl}/users/createUser`, formData);
        setShowModal(false);
        setShowPendingModal(true); 
      }
    } catch (error) {
        const backendError = error.response?.data?.error;

        if (backendError === 'EMAIL_ALREADY_EXISTS') {
            showMessage(t('auth.errors.emailExists', "Този имейл вече е регистриран!"));
        } else if (backendError === 'PHONE_ALREADY_EXISTS') {
            showMessage(t('auth.errors.phoneExists', "Този телефон вече е регистриран!"));
        } else if (backendError === 'ERROR_SENDING_CODE') {
            showMessage(t('login.sendCodeError', "Грешка при изпращане на кода."));
        } else {
            showMessage(t('signup.networkError', "Възникна грешка!"));
        }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    try {
      const userData = { 
        email: decoded.email, 
        name: decoded.name,
        phoneNumber: decoded.phone_number || null
      };

      const res = await Axios.post(`${backendUrl}/users/googleAuth`, { userData });
      
      if (res.data.success) {
        if (res.data.token) localStorage.setItem("token", res.data.token);
        dispatch(loginSuccess(res.data.user));
        showMessage(t('signup.googleSuccess', "Успешна регистрация чрез Google за {{name}}", { name: res.data.user.name }), "success");
        setTimeout(() => navigate(res.data.user.isAdmin ? "/admin/users" : "/profile"), 2000);
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      // Хващаме системния код ACCOUNT_NOT_APPROVED или статус 403
      if (error.response?.status === 403 || backendError === 'ACCOUNT_NOT_APPROVED') {
        setShowPendingModal(true);
      } else {
        console.error("Google Auth error:", error);
        showMessage(t('login.googleError', "Грешка при Google регистрация"));
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId="892010529401-22cdmul6vrfsrqq16ifstqb8oqr49vnr.apps.googleusercontent.com">
      <div className="min-h-screen flex bg-slate-900 relative">
        
        {/* Лява част: Снимка */}
        <div 
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9)), url(${backgroundImage})` 
          }}
        >
          <div className="h-full flex flex-col justify-center px-12 text-white">
            <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">{t('signup.leftPanel.title', 'Присъединете се към нас')}</h2>
            <p className="text-xl text-slate-300">{t('signup.leftPanel.subtitle', 'Създайте профил и започнете да анализирате данни с мощта на OSINT.')}</p>
          </div>
        </div>

        {/* Дясна част: Форма за регистрация */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12">
          <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-3xl font-black text-white text-center mb-8 uppercase tracking-widest">{t('signup.form.title', 'Създай профил')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-1">{t('profile.fields.name', 'Име и Фамилия')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-bold mb-1">{t('profile.fields.email', 'Имейл')}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-bold mb-1">{t('profile.fields.phone', 'Телефон')}</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all" placeholder="+359..." />
              </div>

              <div className="relative">
                <label className="block text-slate-400 text-sm font-bold mb-1">{t('login.form.passwordLabel', 'Парола')}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:border-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-slate-400 text-sm font-bold mb-1">{t('forgotPassword.confirmPasswordLabel', 'Повтори парола')}</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:border-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all flex justify-center items-center mt-6">
                {loading ? t('forgotPassword.processing', 'Обработка...') : t('signup.form.submitBtn', 'Регистрирай се')}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="px-4 text-slate-500 text-xs font-bold tracking-widest">{t('login.form.or', 'ИЛИ')}</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="flex justify-center">
                 <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => showMessage(t('login.googleError', "Грешка при Google регистрация"))} theme="filled_black" shape="rectangular" text="signup_with" />
              </div>
            </form>

            <p className="mt-6 text-center text-slate-400 text-sm">
              {t('signup.form.alreadyHaveAccount', 'Вече имате акаунт?')} <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4">{t('nav.login', 'Вход')}</Link>
            </p>
          </div>
        </div>

        {/* Modal за Верификация */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2 text-center">{t('login.modalForgot.title', 'Верификация')}</h3>
              <p className="text-slate-400 text-sm mb-6 text-center">{t('signup.modalVerify.subtitle', 'Изпратихме код на')} <span className="text-blue-400">{formData.email}</span></p>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder={t('login.modalForgot.placeholder', '6-цифрен код')} 
                className="w-full bg-slate-900 border border-slate-700 text-white text-center text-xl tracking-widest rounded-lg p-4 mb-6 focus:border-blue-500 outline-none" maxLength={6} />
              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">{t('common.cancel', 'Отказ')}</button>
                <button onClick={handleModalSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">{t('common.confirm', 'Потвърди')}</button>
              </div>
            </div>
          </div>
        )}

        {/* НОВ МОДАЛ: Успешна регистрация и чакане на одобрение */}
        {showPendingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div className="bg-slate-800 border border-blue-500/30 rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                        <FaCheck className="text-blue-500 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t('signup.modalPending.title', 'Заявката е получена')}</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        {t('signup.modalPending.description', 'Благодарим Ви за регистрацията! Вашият профил ще бъде разгледан в рамките на следващите 24 часа. Ще получите имейл потвърждение, веднага щом администратор активира акаунта Ви.')}
                    </p>
                    <button onClick={() => navigate("/login")} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                        {t('signup.modalPending.backBtn', 'Разбрах, към Вход')}
                    </button>
                </div>
            </div>
        )}

      </div>
    </GoogleOAuthProvider>
  );
}

export default Signup;