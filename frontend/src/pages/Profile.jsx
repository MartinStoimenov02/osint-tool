import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaUserCircle, FaCheck, FaTimes, FaShieldAlt, FaQrcode } from "react-icons/fa";
import FeedbackModal from "../components/FeedbackModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import Disable2FAModal from "../components/Disable2FAModal";
import Axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/userSlice';
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editedUser, setEditedUser] = useState({ ...user });
  const [editingField, setEditingField] = useState(null);
  
  // Модали
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 2FA Стейтове
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  
  // Стейт за грешки СПЕЦИАЛНО за 2FA модала
  const [setup2FAError, setSetup2FAError] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const showStatus = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Помощна функция за затваряне на 2FA модала и чистене на данните
  const close2FAModal = () => {
    setShow2FASetupModal(false);
    setTwoFactorToken("");
    setSetup2FAError(""); 
  };

  const cancelEdit = () => {
    setEditedUser(user);
    setEditingField(null);
  };

  const handleFieldChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const validateField = (field, value) => {
    if (field === "phoneNumber" && (!value || value.trim() === "")) return null;
    
    if (field === "phoneNumber") {
      const phoneNumberRegex = /^[0-9+/]+$/;
      const digitCount = value.replace(/\D/g, "").length;
      if (!phoneNumberRegex.test(value) || digitCount < 10) {
        return t('profile.errors.invalidPhone', "Невалиден телефонен номер (мин. 10 цифри).");
      }
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return t('profile.errors.invalidEmail', "Невалиден имейл адрес.");
    }

    if (field === "name" && !value) return t('profile.errors.nameRequired', "Името е задължително.");
    
    return null;
  };

  const saveField = async (field) => {
    const error = validateField(field, editedUser[field]);
    if (error) return showStatus(error);

    try {
      const token = localStorage.getItem("token");
      const res = await Axios.put(`${backendUrl}/users/updateField`, {
        id: user.id,
        field,
        newValue: editedUser[field],
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Проверяваме за системния код за успех
      if (res.data.success) {
        showStatus(t('profile.success.updated', "Обновено успешно!"), "success");
        dispatch(loginSuccess({ ...user, [field]: editedUser[field] }));
        setEditingField(null);
      }
    } catch (error) {
      console.error("Field update error:", error);
      const backendError = error.response?.data?.error;

      if (backendError === 'USER_NOT_FOUND') {
          showStatus(t('auth.errors.userNotFound', "Потребителят не е намерен."));
      } else if (backendError === 'INVALID_FIELD') {
          showStatus(t('profile.errors.invalidField', "Невалидно поле за обновяване."));
      } else {
          showStatus(t('profile.errors.saveError', "Грешка при запис."));
      }
    }
  };

  const deleteAccountAndLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- 2FA ФУНКЦИОНАЛНОСТИ ---

  const handleGenerate2FA = async () => {
    setIs2FALoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await Axios.post(`${backendUrl}/users/generate-2fa`, { userId: user.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setQrCode(res.data.qrCode);
        setRecoveryCodes(res.data.recoveryCodes);
        setShow2FASetupModal(true);
      }
    } catch (error) {
      console.error("2FA Generate error:", error);
      const backendError = error.response?.data?.error;

      if (backendError === '2FA_ALREADY_ENABLED') {
          showStatus(t('auth.errors.alreadyEnabled2fa', "2FA вече е активирана."));
      } else {
          showStatus(t('profile.errors.generate2FA', "Грешка при генериране на 2FA."));
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FASetup = async () => {
    if (!twoFactorToken || twoFactorToken.length < 6) {
      setSetup2FAError(t('profile.errors.invalid6Digit', "Моля, въведете валиден 6-цифрен код.")); 
      return;
    }
    
    setIs2FALoading(true);
    setSetup2FAError(""); 
    try {
      const token = localStorage.getItem("token");
      const cleanToken = twoFactorToken.replace(/\s+/g, ""); 
      
      const res = await Axios.post(`${backendUrl}/users/verify-2fa-setup`, {
        userId: user.id,
        token: cleanToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showStatus(t('profile.success.twoFactorEnabled', "2FA е успешно активирана!"), "success"); 
        dispatch(loginSuccess({ ...user, isTwoFactorEnabled: true }));
        close2FAModal();
      }
    } catch (error) {
      console.error("2FA Verify error:", error);
      const backendError = error.response?.data?.error;

      if (backendError === 'INVALID_2FA_CODE') {
          setSetup2FAError(t('auth.errors.invalid2faCode', "Невалиден код."));
      } else {
          setSetup2FAError(t('profile.errors.verifyError', "Грешка при потвърждаване."));
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  // Само отваря модала
  const handleDisable2FAClick = () => {
    setShowDisable2FAModal(true);
  };

  // Реалното изключване, което се вика от модала
  const confirmDisable2FA = async () => {
    setShowDisable2FAModal(false);
    setIs2FALoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await Axios.post(`${backendUrl}/users/disable-2fa`, { userId: user.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showStatus(t('profile.success.twoFactorDisabled', "2FA е изключена."), "success");
        dispatch(loginSuccess({ ...user, isTwoFactorEnabled: false }));
      }
    } catch (error) {
      console.error("2FA Disable error:", error);
      showStatus(t('profile.errors.disable2FA', "Грешка при изключване на 2FA."));
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header на профила */}
        <div className="bg-slate-700/30 p-8 flex flex-col items-center border-b border-slate-700">
          <div className="text-7xl text-blue-500 mb-4">
            <FaUserCircle />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{user.name}</h2>
          <p className="text-slate-400 text-sm">{t('profile.userOf', 'Потребител на OSI-HR')}</p>
        </div>

        {/* Данни */}
        <div className="p-8 space-y-6">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold ${message.type === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Полета */}
          {[
            { label: t('profile.fields.email', "Имейл адрес"), field: "email", type: "email" },
            { label: t('profile.fields.name', "Име и Фамилия"), field: "name", type: "text" },
            { label: t('profile.fields.phone', "Телефонен номер"), field: "phoneNumber", type: "text", placeholder: t('profile.fields.noPhone', "Няма добавен телефон") }
          ].map((item) => (
            <div key={item.field} className="group">
              <label className="block text-slate-500 text-xs font-bold uppercase mb-2">{item.label}</label>
              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700 group-hover:border-slate-600 transition-all">
                {editingField === item.field ? (
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type={item.type}
                      value={editedUser[item.field] || ""}
                      onChange={(e) => handleFieldChange(item.field, e.target.value)}
                      className="bg-transparent text-white outline-none w-full"
                      autoFocus
                    />
                    <button onClick={() => saveField(item.field)} className="text-green-500 hover:text-green-400"><FaCheck /></button>
                    <button onClick={cancelEdit} className="text-red-500 hover:text-red-400"><FaTimes /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-slate-200">{editedUser[item.field] || item.placeholder}</span>
                    <button onClick={() => setEditingField(item.field)} className="text-slate-500 hover:text-blue-400">
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* СЕКЦИЯ СИГУРНОСТ (2FA) */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaShieldAlt /> {t('profile.security.title', 'Сигурност')}
            </h3>
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div>
                <h4 className="text-white font-bold">{t('profile.security.twoFactorTitle', 'Двуфакторна автентикация (2FA)')}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {t('profile.security.twoFactorDesc', 'Допълнителна защита с Google Authenticator.')}
                </p>
              </div>
              <div>
                {user.isTwoFactorEnabled ? (
                  <button 
                    onClick={handleDisable2FAClick} 
                    disabled={is2FALoading}
                    className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm font-bold transition-all"
                  >
                    {t('profile.security.disableBtn', 'Изключи')}
                  </button>
                ) : (
                  <button 
                    onClick={handleGenerate2FA} 
                    disabled={is2FALoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                  >
                    {t('profile.security.enableBtn', 'Включи')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Бутони за действия */}
        <div className="p-8 bg-slate-900/30 flex flex-wrap gap-4 border-t border-slate-700">
          {user.hasPassword && (
            <button onClick={() => setIsChangePasswordOpen(true)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-all">
              {t('profile.actions.changePassword', 'Смени парола')}
            </button>
          )}
          <button onClick={() => setIsFeedbackOpen(true)} className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/50 rounded-lg text-sm font-bold transition-all">
            {t('profile.actions.feedback', 'Обратна връзка')}
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ml-auto">
            <FaTrash size={12}/> {t('profile.actions.deleteAccount', 'Изтрий акаунт')}
          </button>
        </div>
      </div>

      {/* МОДАЛ ЗА 2FA НАСТРОЙКА */}
      {show2FASetupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8 relative">
            
            {/* Бутон "Х" горе вдясно */}
            <button onClick={close2FAModal} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <FaTimes size={20} />
            </button>

            <div className="flex items-center mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest">
                <FaQrcode className="text-blue-500" /> {t('profile.modal2FA.title', 'Настройка на 2FA')}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Стъпка 1: QR Код */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                <p className="text-slate-300 text-sm font-bold mb-4">{t('profile.modal2FA.step1', '1. Сканирайте QR кода с Authenticator приложение')}</p>
                <div className="bg-white p-2 rounded-lg inline-block">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* Стъпка 2: Recovery Кодове */}
              <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50">
                <p className="text-red-400 text-sm font-bold mb-2">{t('profile.modal2FA.step2Title', '2. ЗАПАЗЕТЕ ТЕЗИ КОДОВЕ!')}</p>
                <p className="text-xs text-slate-400 mb-3">{t('profile.modal2FA.step2Desc', 'Ако загубите достъп до телефона си, тези кодове са единственият начин да влезете. Всеки код може да се използва само веднъж.')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded text-center text-slate-300 font-mono text-sm tracking-widest border border-slate-800">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Стъпка 3: Потвърждение */}
              <div>
                <p className="text-slate-300 text-sm font-bold mb-3">{t('profile.modal2FA.step3', '3. Въведете 6-цифрения код от приложението')}</p>
                
                {setup2FAError && (
                  <div className="bg-red-900/50 text-red-400 border border-red-800 p-3 rounded-lg text-sm font-medium mb-4 text-center">
                    {setup2FAError}
                  </div>
                )}
                
                <input 
                  type="text" 
                  value={twoFactorToken} 
                  onChange={(e) => setTwoFactorToken(e.target.value)} 
                  placeholder="000000" 
                  className="w-full bg-slate-900 border border-slate-700 text-white text-center text-2xl tracking-[0.5em] font-mono rounded-lg p-3 focus:border-blue-500 outline-none" 
                  maxLength={6} 
                />
              </div>

              <button 
                onClick={handleVerify2FASetup} 
                disabled={is2FALoading || twoFactorToken.length < 6} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-all"
              >
                {is2FALoading ? t('profile.modal2FA.checking', 'Проверка...') : t('profile.modal2FA.confirmBtn', 'Потвърди и Активирай')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Други модали */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} setIsModalOpenSuccess={() => showStatus(t('profile.success.feedbackSent', "Благодарим за фийдбека!"), "success")} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} email={user.email} setChangedPasswordSuccess={() => showStatus(t('profile.success.passwordChanged', "Паролата е променена!"), "success")} />
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onSuccess={deleteAccountAndLogout} user={user} />
      <Disable2FAModal isOpen={showDisable2FAModal} onClose={() => setShowDisable2FAModal(false)} onConfirm={confirmDisable2FA} isLoading={is2FALoading} />
    </div>
  );
};

export default Profile;