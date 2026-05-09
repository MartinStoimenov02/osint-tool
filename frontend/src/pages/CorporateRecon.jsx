import React, { useState } from 'react';
import axios from 'axios';
import { 
  FaBuilding, FaSearch, FaEnvelope, FaExclamationTriangle, 
  FaCity, FaIndustry, FaTwitter, FaLinkedin, FaSitemap,
  FaCrosshairs, FaCheckCircle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const CorporateRecon = () => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyData, setCompanyData] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [finderLoading, setFinderLoading] = useState(false);
  const [finderError, setFinderError] = useState('');
  const [finderResult, setFinderResult] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // 1. ОСНОВНО ТЪРСЕНЕ НА ДОМЕЙН
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
        setError(t('corporateRecon.errors.invalidDomain', 'Моля, въведете валиден домейн (напр. stripe.com)'));
        return;
    }

    setLoading(true);
    setError('');
    setCompanyData(null);
    setFinderResult(null);
    setFirstName('');
    setLastName('');

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/osint/searchCompany?domain=${encodeURIComponent(domain.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCompanyData(res.data);
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.error;
      
      if (backendError === 'MISSING_DOMAIN') {
          setError(t('corporateRecon.errors.invalidDomain', 'Моля, въведете валиден домейн (напр. stripe.com)'));
      } else {
          setError(err.response?.data?.details || t('corporateRecon.errors.serverError', "Грешка при комуникацията със сървъра. Проверете API ключа си."));
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. БРОНИРАН СНАЙПЕРИСТ
  const handleFindPerson = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
        setFinderError(t('corporateRecon.errors.missingName', 'Моля, въведете Име и Фамилия.'));
        return;
    }

    setFinderLoading(true);
    setFinderError('');
    setFinderResult(null);

    const fName = firstName.trim().toLowerCase();
    const lName = lastName.trim().toLowerCase();

    // СТЪПКА 1: Проверка в локалния кеш
    const localMatch = companyData?.emails?.find(emp => 
        emp.first_name?.toLowerCase() === fName && emp.last_name?.toLowerCase() === lName
    );

    if (localMatch) {
        setFinderResult({
            email: localMatch.value,
            score: localMatch.confidence || 100,
            isLocal: true,
            isPrediction: false
        });
        setFinderLoading(false);
        return;
    }

    // СТЪПКА 2: Опит през Hunter API
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/osint/findPerson`, {
        params: { firstName: fName, lastName: lName, domain: companyData.domain },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Застраховаме се срещу различно пакетиране на данните от бекенда
      const apiData = res.data?.data || res.data;

      // Ако API-то върне успешен статус, но е празно -> ФОРСИРАМЕ ГРЕШКА
      if (!apiData || !apiData.email) {
          throw new Error("Empty response from Hunter");
      }
      
      // Ако всичко е точно, записваме реалния резултат
      setFinderResult({
          email: apiData.email,
          score: apiData.score || 99,
          isLocal: false,
          isPrediction: false
      });

    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.error;

      if (backendError === 'MISSING_PERSON_PARAMS') {
          setFinderError(t('corporateRecon.errors.missingName', 'Моля, въведете Име и Фамилия.'));
          setFinderLoading(false);
          return;
      }

      // СТЪПКА 3: FALLBACK КЪМ ШАБЛОН (Умният предсказател)
      if (companyData?.pattern) {
          let patternStr = companyData.pattern;
          let generatedEmail = patternStr
              .replace('{first}', fName)
              .replace('{last}', lName)
              .replace('{f}', fName.charAt(0))
              .replace('{l}', lName.charAt(0));

          setFinderResult({
              email: `${generatedEmail}@${companyData.domain}`,
              score: 50,
              isLocal: false,
              isPrediction: true 
          });
      } else {
          setFinderError(t('corporateRecon.errors.notFound', "Лицето не беше открито и фирмата няма ясен шаблон за генериране."));
      }
    } finally {
      setFinderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Хедър и Търсачка за Домейн */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <FaBuilding className="text-6xl text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">{t('corporateRecon.title', 'Corporate Recon')}</h1>
            <p className="text-slate-400 mt-2 max-w-xl">
              {t('corporateRecon.subtitle', 'Въведете домейн на компания, за да картографирате фирмената структура и вътрешните имейли.')}
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl p-2 focus-within:border-emerald-500 transition-colors shadow-lg">
              <FaSearch className="text-slate-400 ml-4 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder={t('corporateRecon.searchPlaceholder', 'company.com (напр. stripe.com)')}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-transparent text-white p-3 outline-none text-lg placeholder-slate-500 font-mono"
              />
              <button 
                type="submit" 
                disabled={loading || !domain}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg transition-all ml-2"
              >
                {loading ? t('corporateRecon.scanning', 'Сканиране...') : t('corporateRecon.analyze', 'Анализ')}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 max-w-2xl mx-auto bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* РЕЗУЛТАТИ */}
        {companyData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ЛЯВА КОЛОНА: Основно инфо */}
            <div className="space-y-6">
              
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">{t('corporateRecon.targetMapped', 'Target Mapped')}</div>
                 <h2 className="text-2xl font-black text-white mt-4">{companyData.organization || domain}</h2>
                 <p className="text-emerald-400 font-mono text-sm mb-6">{companyData.domain}</p>
                 
                 <div className="space-y-3 pt-4 border-t border-slate-700 text-sm">
                   {companyData.industry && (
                     <div className="flex items-center gap-3 text-slate-300">
                       <FaIndustry className="text-slate-500 w-4 shrink-0" /> <span>{companyData.industry}</span>
                     </div>
                   )}
                   {(companyData.city || companyData.country) && (
                     <div className="flex items-center gap-3 text-slate-300">
                       <FaCity className="text-slate-500 w-4 shrink-0" /> 
                       <span>{companyData.city}{companyData.city && companyData.country ? ', ' : ''}{companyData.country}</span>
                     </div>
                   )}
                   {companyData.twitter && (
                     <div className="flex items-center gap-3 text-slate-300">
                       <FaTwitter className="text-blue-400 w-4 shrink-0" /> 
                       <a href={`https://twitter.com/${companyData.twitter}`} target="_blank" rel="noreferrer" className="hover:underline">@{companyData.twitter}</a>
                     </div>
                   )}
                   {companyData.linkedin && (
                     <div className="flex items-center gap-3 text-slate-300">
                       <FaLinkedin className="text-blue-600 w-4 shrink-0" /> 
                       <a href={companyData.linkedin} target="_blank" rel="noreferrer" className="hover:underline">{t('corporateRecon.linkedinProfile', 'LinkedIn Профил')}</a>
                     </div>
                   )}
                 </div>
              </div>

              {/* ИМЕЙЛ ШАБЛОН */}
              <div className="bg-slate-800 border border-emerald-900/50 rounded-3xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                  <FaEnvelope className="text-emerald-500 text-lg" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('corporateRecon.emailPattern', 'Email Шаблон')}</h3>
                </div>
                
                {companyData.pattern ? (
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-center">
                    <p className="text-lg text-emerald-400 font-mono font-bold tracking-wider">{companyData.pattern}</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">{t('corporateRecon.extractedFromPublic', 'Извлечен от публични записи')}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center">{t('corporateRecon.noPatternFound', 'Не е открит ясен модел за имейлите.')}</p>
                )}
              </div>

            </div>

            {/* ДЯСНА КОЛОНА: Снайперист и Служители */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* СНАЙПЕРИСТ */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                  <FaCrosshairs className="text-indigo-400 text-xl" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('corporateRecon.sniperTitle', 'Снайперист (Direct Target)')}</h3>
                    <p className="text-xs text-slate-400">{t('corporateRecon.sniperSubtitle', 'Намерете имейл на конкретен служител')}</p>
                  </div>
                </div>

                <form onSubmit={handleFindPerson} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder={t('corporateRecon.firstNamePlaceholder', 'Първо Име (напр. John)')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 p-3 rounded-xl outline-none text-white focus:border-indigo-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder={t('corporateRecon.lastNamePlaceholder', 'Фамилия (напр. Doe)')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 p-3 rounded-xl outline-none text-white focus:border-indigo-500 transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={finderLoading || !firstName || !lastName}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all shrink-0"
                  >
                    {finderLoading ? t('corporateRecon.searching', 'Търсене...') : t('corporateRecon.extract', 'Извлечи')}
                  </button>
                </form>

                {finderError && <p className="text-red-400 text-xs mt-3 bg-red-900/30 p-2 rounded border border-red-800/50">{finderError}</p>}
                
                {finderResult && (
                  <div className="mt-4 bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">{t('corporateRecon.foundEmail', 'Открит Имейл:')}</span>
                        {/* ДИНАМИЧНИ БАДЖОВЕ */}
                        {finderResult.isLocal && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Local Cache</span>}
                        {finderResult.isPrediction && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Pattern Guess</span>}
                      </div>
                      <p className="text-lg text-white font-mono font-black">{finderResult.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">{t('corporateRecon.confidence', 'Увереност')}</span>
                      <span className={`flex items-center gap-1 justify-end font-bold text-sm ${finderResult.isPrediction ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        <FaCheckCircle /> {finderResult.score}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* СПИСЪК СЪС СЛУЖИТЕЛИ */}
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <FaSitemap className="text-emerald-500 text-xl" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">{t('corporateRecon.foundEmployees', 'Открити Служители')} ({companyData.emails?.length || 0})</h3>
                  </div>
                </div>

                {companyData.emails && companyData.emails.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {companyData.emails.map((emp, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                        <div>
                           <span className="font-bold text-white text-sm block mb-1">
                             {emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : t('corporateRecon.anonymousEmployee', 'Анонимен Служител')}
                           </span>
                           {emp.position && <span className="text-xs text-emerald-400 font-bold block mb-3 uppercase tracking-wider">{emp.position}</span>}
                           <span className="text-sm text-slate-300 font-mono bg-slate-800 px-2 py-1 rounded inline-block">{emp.value}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                           {emp.department && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">{emp.department}</span>}
                           {emp.type && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">{emp.type}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-center text-slate-500 py-8">{t('corporateRecon.noEmailsFound', 'Не са намерени публични имейли за този домейн.')}</p>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CorporateRecon;