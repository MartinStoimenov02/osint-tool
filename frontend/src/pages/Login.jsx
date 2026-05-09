import React, { useState } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/userSlice'; 
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ
import backgroundImage from "../images/photo-2.jpeg";

function Login() {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Стандартни модали (Забравена парола)
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Нови стейтове за 2FA
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);

  const [twoFactorError, setTwoFactorError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const finalizeLogin = (data) => {
    if (data.token) localStorage.setItem("token", data.token);
    dispatch(loginSuccess(data.user));
    
    // Динамично съобщение за добре дошъл
    const welcomeMsg = data.user.name 
      ? t('login.welcome', 'Добре дошли, {{name}}!', { name: data.user.name }) 
      : t('login.successLogin', 'Успешен вход!');
    
    showMessage(welcomeMsg, "success");
    
    setTimeout(() => {
      if (data.user.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/tools/github");
      }
    }, 1500);
  };

  // Обикновен вход
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.post(`${backendUrl}/users/getUser`, formData);
      if (res.data.success) {
        if (res.data.requires2FA) {
          setPendingUserId(res.data.userId);
          setShow2FAModal(true);
        } else {
          finalizeLogin(res.data);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const backendError = error.response?.data?.error;

      if (backendError === 'INVALID_CREDENTIALS') {
          showMessage(t('auth.errors.invalidCredentials', "Грешен имейл или парола"));
      } else if (backendError === 'ACCOUNT_NOT_APPROVED') {
          showMessage(t('auth.errors.accountNotApproved', "Вашият профил все още не е одобрен от администратор."));
      } else {
          showMessage(t('login.serverError', "Грешка при свързване със сървъра"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Вход
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    try {
      const userData = { email: decoded.email, name: decoded.name, phoneNumber: decoded.phone_number || null };
      const res = await Axios.post(`${backendUrl}/users/googleAuth`, { userData });
      
      if (res.data.success) {
        if (res.data.requires2FA) {
           setPendingUserId(res.data.userId);
           setShow2FAModal(true);
        } else {
           finalizeLogin(res.data);
        }
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError === 'ACCOUNT_NOT_APPROVED') {
          showMessage(t('auth.errors.accountNotApproved', "Вашият профил все още не е одобрен от администратор."));
      } else {
          showMessage(t('login.googleError', "Грешка при Google вход"));
      }
    }
  };

  // Потвърждаване на 2FA кода
const handleVerify2FA = async () => {
    if (!twoFactorCode) return;
    setLoading(true);
    setTwoFactorError(""); 
    try {
      const cleanToken = twoFactorCode.replace(/\s+/g, ""); 
      
      const res = await Axios.post(`${backendUrl}/users/verify-2fa-login`, {
        userId: pendingUserId,
        token: cleanToken
      });

      if (res.data.success) {
        setShow2FAModal(false);
        setTwoFactorCode("");
        finalizeLogin(res.data);
      } else {
        // ТУК Е ПРОМЯНАТА
        setTwoFactorError(t('login.invalidCode', "Невалиден код."));
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError === 'INVALID_2FA_CODE') {
          setTwoFactorError(t('auth.errors.invalid2faCode', "Невалиден или изтекъл код."));
      } else {
          setTwoFactorError(t('login.verifyCodeError', "Грешка при проверка на кода."));
      }
    } finally {
      setLoading(false);
    }
  };

const handleForgotPasswordClick = async () => {
    if (!formData.email) {
      showMessage(t('login.enterEmail', "Моля, въведете имейл адрес."));
      return;
    }
    setLoading(true);
    try {
      const userCheck = await Axios.post(`${backendUrl}/users/checkUserExists`, { email: formData.email });
      if (!userCheck.data.exists) {
        showMessage(t('login.emailNotFound', "Имейлът не е намерен."));
        setLoading(false);
        return;
      }
      await Axios.post(`${backendUrl}/email/sendVerificationCode`, { email: formData.email });
      showMessage(t('login.codeSent', "Кодът е изпратен."), "success");
      setShowModal(true);
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError === 'ERROR_SENDING_CODE') {
          showMessage(t('login.sendCodeError', "Грешка при изпращане на кода."));
      } else if (backendError === 'USER_NOT_FOUND') {
          showMessage(t('auth.errors.userNotFound', "Имейлът не е намерен."));
      } else {
          showMessage(t('login.serverError', "Грешка при свързване със сървъра"));
      }
    } finally {
      setLoading(false);
    }
  };

const handleVerifyCode = async () => {
    try {
      const res = await Axios.post(`${backendUrl}/email/verifyCode`, { email: formData.email, code: verificationCode });
      if (res.data.success) {
        setShowModal(false);
        navigate("/forgot-password", { state: { email: formData.email, allowed: true } });
      } else {
        showMessage(t('login.invalidCode', "Невалиден код."));
      }
    } catch (error) {
      const backendError = error.response?.data?.error;
      if (backendError === 'INVALID_CODE') {
          showMessage(t('login.invalidCode', "Невалиден код."));
      } else {
          showMessage(t('login.verifyCodeError', "Грешка при проверката на кода."));
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId="892010529401-22cdmul6vrfsrqq16ifstqb8oqr49vnr.apps.googleusercontent.com">
      <div className="min-h-screen flex bg-slate-900 relative">
        <div className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9)), url(${backgroundImage})` }}>
          <div className="h-full flex flex-col justify-center px-12 text-white">
            <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">{t('login.leftPanel.title', 'OSINT Intelligence')}</h2>
            <p className="text-xl text-slate-300">{t('login.leftPanel.subtitle', 'Продължете вашето проучване и открийте следващия топ талант.')}</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12">
          <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-3xl font-black text-white text-center mb-8 uppercase tracking-widest">{t('login.form.title', 'Вход')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">{t('login.form.emailLabel', 'Имейл')}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all" />
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-400 text-sm font-bold">{t('login.form.passwordLabel', 'Парола')}</label>
                  <button type="button" onClick={handleForgotPasswordClick} className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">{t('login.form.forgotPassword', 'Забравена парола?')}</button>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:border-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all">
                {loading ? t('login.form.authenticating', 'Автентикация...') : t('login.form.loginBtn', 'Влез в системата')}
              </button>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="px-4 text-slate-500 text-xs font-bold tracking-widest">{t('login.form.or', 'ИЛИ')}</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="flex justify-center">
                 <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => showMessage(t('login.googleError', "Грешка при Google вход"))} theme="filled_black" shape="rectangular" useOneTap />
              </div>
            </form>
            <p className="mt-8 text-center text-slate-400 text-sm">
              {t('login.form.noAccount', 'Нямате акаунт?')} <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4">{t('login.form.register', 'Регистрация')}</Link>
            </p>
          </div>
        </div>

        {/* МОДАЛ ЗА ЗАБРАВЕНА ПАРОЛА */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2 text-center">{t('login.modalForgot.title', 'Верификация')}</h3>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder={t('login.modalForgot.placeholder', '6-цифрен код')} 
                className="w-full bg-slate-900 border border-slate-700 text-white text-center text-xl tracking-widest rounded-lg p-4 mb-6 focus:border-blue-500 outline-none" maxLength={6} />
              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">{t('common.cancel', 'Отказ')}</button>
                <button onClick={handleVerifyCode} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">{t('common.confirm', 'Потвърди')}</button>
              </div>
            </div>
          </div>
        )}

        {/* МОДАЛ ЗА 2FA (Двуфакторна автентикация) */}
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-blue-900/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(37,99,235,0.15)]">
              <div className="flex justify-center mb-4 text-blue-500">
                <FaShieldAlt size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center uppercase tracking-widest">{t('login.modal2FA.title', 'Двуфакторна защита')}</h3>
              <p className="text-slate-400 text-sm text-center mb-6">{t('login.modal2FA.description', 'Отворете Google Authenticator и въведете 6-цифрения код или използвайте Recovery код.')}</p>
              {twoFactorError && (
                <div className="bg-red-900/50 text-red-400 border border-red-800 p-3 rounded-lg text-sm font-medium mb-4 text-center">
                  {twoFactorError}
                </div>
              )}

              <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="000000" 
                className="w-full bg-slate-900 border border-slate-700 text-white text-center text-2xl tracking-[0.5em] font-mono rounded-lg p-4 mb-6 focus:border-blue-500 outline-none" />
              
              <div className="flex gap-4">
                <button onClick={() => { setShow2FAModal(false); setPendingUserId(null); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">{t('common.cancel', 'Отказ')}</button>
                <button onClick={handleVerify2FA} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                  {loading ? "..." : t('login.modal2FA.loginBtn', 'Влез')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;