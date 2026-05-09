import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, HelpCircle, Globe, User, Bell } from 'lucide-react';
import { FaSignOutAlt, FaSignInAlt, FaUserPlus, FaGithub, FaBuilding, FaFingerprint, FaFolderOpen } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/userSlice';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';

// Твоите компоненти
import Notifications from '../pages/Notifications';
import Help from '../components/Help';

const Header = () => {
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Стейтове
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/';

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Функция за смяна на езика
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false); 
  };

  useEffect(() => {
    if (isAuthenticated && user?.firstLogin) {
      const disableFirstLogin = async () => {
        try {
          const token = localStorage.getItem("token");
          
          await Axios.put(`${backendUrl}/users/updateField`, {
            id: user.id || user._id,
            field: "firstLogin",
            newValue: false,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setTimeout(() => {
            setHelpOpen(true);
            const updatedUser = { ...user, firstLogin: false };
            dispatch(loginSuccess(updatedUser));
          }, 0);
          
        } catch (error) {
          const backendError = error.response?.data?.error;
          if (backendError === 'ERROR_UPDATING_FIELD') {
            console.error(t('header.errors.updateFirstLoginFailed', 'Грешка при актуализиране на firstLogin статуса.'));
          } else if (backendError === 'USER_NOT_FOUND') {
            // ДОБАВИ ТОЗИ ELSE IF:
            console.error(t('auth.errors.userNotFound', 'Потребителят не е намерен.'));
          } else {
            console.error("Грешка при обновяване на firstLogin:", error);
          }
        }
      };

      disableFirstLogin();
    }
  }, [isAuthenticated, user, dispatch, backendUrl]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user) return;
      try {
        const res = await Axios.get(`${backendUrl}/notifications/getNotificationsForUser`, {
          params: { userId: user.id || user._id }
        });
        if (res.data && res.data.data) {
          const unread = res.data.data.some(notification => !notification.isRead);
          setHasUnreadNotifications(unread);
        }
      } catch (err) {
        const backendError = err.response?.data?.error; // Увери се, че е така
        if (backendError === 'ERROR_FETCHING_NOTIFICATIONS') {
          console.error(t('notifications.errors.fetchFailed', 'Грешка при зареждане на нотификациите'));
        } else {
          console.error("Грешка при взимане на нотификациите:", err);
        }
      }
    };

    fetchUnreadNotifications();
  }, [user, backendUrl]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate('/login');
  };

  // Преди return на Header
  const languageSelector = (
    <div className="relative flex items-center">
      <button onClick={() => setLangOpen(!langOpen)} className="text-slate-300 hover:text-white transition-colors">
        <Globe size={isAuthenticated ? 24 : 20} />
      </button>
      {langOpen && (
        <div className="absolute right-0 mt-4 top-full w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[60] overflow-hidden text-white">
          <button 
            className={`w-full px-4 py-2 text-left hover:bg-slate-700 font-bold text-sm ${i18n.language === 'bg' ? 'text-blue-400' : 'text-white'}`} 
            onClick={() => changeLanguage('bg')}
          >
            Български
          </button>
          <button 
            className={`w-full px-4 py-2 text-left hover:bg-slate-700 font-bold text-sm ${i18n.language === 'en' ? 'text-blue-400' : 'text-slate-400'}`} 
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 text-white p-4 flex justify-between items-center z-50 relative">
      
      {/* ЛЯВА ЧАСТ: Лого */}
      <div 
        className="text-2xl font-black text-blue-500 cursor-pointer flex items-center gap-1 tracking-tighter" 
        // Променяме пътя от "/profile" на "/tools/github"
        onClick={() => navigate(isAuthenticated ? "/tools/github" : "/")}
      >
        OSI-<i className="text-white">HR</i>
      </div>

      {/* ДЯСНА ЧАСТ */}
      {isAuthPage && !isAuthenticated ? (
        <div className="flex gap-6 items-center">
          {languageSelector}
          <Link to="/login" className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold">
            <FaSignInAlt /> {t('nav.login', 'Вход')}
          </Link>
          <Link to="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors font-bold shadow-lg shadow-blue-900/20">
            <FaUserPlus /> {t('nav.signup', 'Регистрация')}
          </Link>
        </div>
      ) : (
        /* Главен контейнер за дясната част */
        <div className="flex items-center">
          
          {/* ГРУПА 1: Иконки (Тук слагаме границата вдясно: pr-5 border-r border-slate-700) */}
          <div className="flex items-center gap-4 pr-5 border-r border-slate-700">
            
            <button onClick={() => setHelpOpen(true)} className="text-slate-300 hover:text-white transition-colors" title={t('nav.help', 'Помощ')}>
              <HelpCircle size={24} />
            </button>
            
            {languageSelector}

            <button onClick={() => navigate('/profile')} className="text-slate-300 hover:text-white transition-colors">
              <User size={24} />
            </button>

            <div className="relative flex items-center">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-slate-300 hover:text-white transition-colors relative">
                <Bell size={24} />
                {hasUnreadNotifications && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f172a] animate-pulse"></span>
                )}
              </button>

              {!isMobile && notificationsOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                  <div className="bg-slate-700/50 p-3 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-sm uppercase tracking-wider text-slate-200">{t('nav.notifications', 'Уведомления')}</span>
                    <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <Notifications setHasUnreadNotifications={setHasUnreadNotifications} />
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {/* ГРУПА 2: Меню и Изход (Добавяме ляв padding: pl-5) */}
          <div className="flex items-center gap-4 pl-5">
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-300 hover:text-white transition-colors">
                <Menu size={28} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] py-2 overflow-hidden">
                  
                  {!user?.isAdmin && (
                    <>
                      <div className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50 mb-1">
                        {t('nav.tools', 'Инструменти')}
                      </div>
                      <Link to="/tools/github" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 font-bold text-sm text-slate-200 transition-colors" onClick={() => setMenuOpen(false)}>
                        <FaGithub className="text-slate-400" /> {t('nav.github_profiler', 'GitHub Profiler')}
                      </Link>
                      <Link to="/tools/corporate" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 font-bold text-sm text-slate-200 transition-colors" onClick={() => setMenuOpen(false)}>
                        <FaBuilding className="text-emerald-500" /> {t('nav.corporate_recon', 'Corporate Recon')}
                      </Link>
                      <Link to="/tools/social" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 font-bold text-sm text-slate-200 transition-colors" onClick={() => setMenuOpen(false)}>
                        <FaFingerprint className="text-fuchsia-500" /> {t('nav.social_scanner', 'Social Scanner')}
                      </Link>
                      <Link to="/tools/saved-profiles" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 font-bold text-sm text-slate-200 transition-colors" onClick={() => setMenuOpen(false)}>
                        <FaFolderOpen className="text-indigo-400" /> {t('nav.saved_profiles', 'Запазени Досиета')}
                      </Link>
                    </>
                  )}

                  {user?.isAdmin && (
                    <>
                      <div className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50 mb-1">
                        {t('nav.admin', 'Администрация')}
                      </div>
                      <Link to="/admin/users" className="block px-4 py-3 hover:bg-slate-700 font-bold text-sm" onClick={() => setMenuOpen(false)}>{t('nav.users', 'Потребители')}</Link>
                      <Link to="/admin/logs" className="block px-4 py-3 hover:bg-slate-700 font-bold text-sm" onClick={() => setMenuOpen(false)}>{t('nav.logs', 'Логове')}</Link>
                      <Link to="/admin/feedback" className="block px-4 py-3 hover:bg-slate-700 font-bold text-sm" onClick={() => setMenuOpen(false)}>{t('nav.feedback', 'Обратни връзки')}</Link>
                    </>
                  )}
                  
                </div>
              )}
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold transition-colors shrink-0 whitespace-nowrap"
            >
              <FaSignOutAlt /> {t('nav.logout', 'Изход')}
            </button>
          </div>

        </div>
      )}

      {/* МОДАЛ ЗА ПОМОЩ */}
      {helpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setHelpOpen(false)}>
          <div className="bg-slate-800 p-0 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800/80">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">{t('nav.help', 'Помощ и ЧЗВ')}</h2>
              <button className="text-slate-400 hover:text-white text-xl transition-colors" onClick={() => setHelpOpen(false)}>✕</button>
            </div>
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <Help />
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛ ЗА НОТИФИКАЦИИ (Само за мобилни) */}
      {isMobile && notificationsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setNotificationsOpen(false)}>
          <div className="bg-slate-800 p-0 rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/80">
              <h2 className="text-lg font-black uppercase tracking-widest text-white">{t('nav.notifications', 'Уведомления')}</h2>
              <button className="text-slate-400 hover:text-white text-xl transition-colors" onClick={() => setNotificationsOpen(false)}>✕</button>
            </div>
            <div className="overflow-y-auto custom-scrollbar">
              <Notifications setHasUnreadNotifications={setHasUnreadNotifications} />
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;