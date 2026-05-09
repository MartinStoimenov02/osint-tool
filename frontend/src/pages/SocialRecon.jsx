import React, { useState } from 'react';
import axios from 'axios';
import { 
  FaFingerprint, FaSearch, FaExclamationTriangle, 
  FaCheckCircle, FaTimesCircle, FaLink, FaUserSecret, FaGoogle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const SocialRecon = () => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanData, setScanData] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleScan = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
        setError(t('socialRecon.errors.emptyUsername', 'Моля, въведете потребителско име.'));
        return;
    }

    setLoading(true);
    setError('');
    setScanData(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/osint/scanSocials?username=${encodeURIComponent(username.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setScanData(res.data);
    } catch (err) {
      console.error(err);
      
      // Извличаме системния код от бекенда
      const backendError = err.response?.data?.error;

      if (backendError === 'MISSING_USERNAME') {
          setError(t('socialRecon.errors.emptyUsername', 'Моля, въведете потребителско име.'));
      } else if (backendError === 'SOCIAL_SCAN_ERROR') {
          setError(t('socialRecon.errors.scanError', "Възникна грешка при сканирането. Сървърът може да е претоварен."));
      } else {
          // Универсална грешка от 'common' обекта, който добавихме по-рано
          setError(t('common.error', "Възникна неочаквана грешка!"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Хедър */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <FaFingerprint className="text-6xl text-fuchsia-500 mb-4 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]" />
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">{t('socialRecon.title', 'Social Media Recon')}</h1>
            <p className="text-slate-400 mt-2 max-w-xl">
              {t('socialRecon.subtitle', 'Cross-Platform Username Enumeration. Въведете юзърнейм, за да проверите дигиталния му отпечатък в множество платформи едновременно.')}
            </p>
          </div>

          <form onSubmit={handleScan} className="max-w-xl mx-auto relative z-10">
            <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl p-2 focus-within:border-fuchsia-500 transition-colors shadow-lg">
              <FaUserSecret className="text-slate-400 ml-4 mr-2 shrink-0 text-xl" />
              <input 
                type="text" 
                placeholder={t('socialRecon.placeholder', 'потребителско_име (напр. ggerganov)')} 
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))} // Забраняваме интервали
                className="w-full bg-transparent text-white p-3 outline-none text-lg placeholder-slate-500 font-mono"
              />
              <button 
                type="submit" 
                disabled={loading || !username}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg transition-all ml-2"
              >
                {loading ? t('socialRecon.scanningBtn', 'Търсене...') : t('socialRecon.scanBtn', 'СКАНИРАЙ')}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 max-w-xl mx-auto bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* РЕЗУЛТАТИ */}
        {loading && (
            <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-fuchsia-400 font-mono animate-pulse uppercase tracking-widest text-sm">{t('socialRecon.checkingDatabases', 'Проверка на бази данни...')}</p>
            </div>
        )}

        {scanData && !loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
                    <FaSearch className="text-fuchsia-500" />
                    {t('socialRecon.resultsFor', 'Резултати за: @{{target}}', { target: scanData.target })}
                </h3>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {scanData.results.map((res, idx) => (
                    <div 
                        key={idx} 
                        className={`p-4 rounded-xl border flex flex-col justify-between h-full transition-all ${
                            res.status === 'FOUND' 
                            ? 'bg-emerald-900/20 border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : res.status === 'MANUAL_DORK'
                            ? 'bg-blue-900/20 border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            : res.status === 'NOT_FOUND'
                            ? 'bg-slate-900 border-slate-700 opacity-60'
                            : 'bg-yellow-900/20 border-yellow-500/50'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-black text-white uppercase tracking-wider">{res.platform}</span>
                            {res.status === 'FOUND' && <FaCheckCircle className="text-emerald-500 text-xl" />}
                            {res.status === 'MANUAL_DORK' && <FaGoogle className="text-blue-500 text-xl" />}
                            {res.status === 'NOT_FOUND' && <FaTimesCircle className="text-slate-600 text-xl" />}
                            {res.status === 'BLOCKED_OR_ERROR' && <FaExclamationTriangle className="text-yellow-500 text-xl" title={res.details} />}
                        </div>
                        
                        <div>
                            {res.status === 'FOUND' ? (
                                <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest bg-emerald-500/10 px-3 py-2 rounded-lg w-max">
                                    <FaLink /> {t('socialRecon.toProfile', 'Към профила')}
                                </a>
                            ) : res.status === 'MANUAL_DORK' ? (
                                <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest bg-blue-500/10 px-3 py-2 rounded-lg w-max">
                                    <FaSearch /> {t('socialRecon.dorkSearch', 'Dork Търсене')}
                                </a>
                            ) : res.status === 'NOT_FOUND' ? (
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('socialRecon.available', 'Свободно / Няма запис')}</span>
                            ) : (
                                <span className="text-[10px] text-yellow-500 font-mono leading-tight block">{t('socialRecon.botProtection', 'Защита от ботове (Timeout)')}</span>
                            )}
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SocialRecon;