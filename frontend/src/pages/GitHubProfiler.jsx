import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  FaGithub, FaSearch, FaEnvelope, FaCode, 
  FaMapMarkerAlt, FaUsers, FaFolderOpen, FaCalendarAlt, 
  FaBrain, FaBuilding, FaArrowLeft, FaExclamationTriangle, FaFilter,
  FaChartBar, FaUserSecret, FaUserFriends,
  FaSave, FaCheck
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ
import PDFExportButton from '../components/PDFExportButton';
import PrintableReport from '../components/PrintableReport';

const GitHubProfiler = () => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const contentRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  
  const [followersFilter, setFollowersFilter] = useState('');
  const [reposFilter, setReposFilter] = useState('');
  const [createdFilter, setCreatedFilter] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null); 

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const currentUser = useSelector((state) => state.user.user); 

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const printRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    let finalQuery = searchTerm.trim();
    if (locationFilter.trim()) finalQuery += ` location:${locationFilter.trim()}`;
    if (languageFilter.trim()) finalQuery += ` language:${languageFilter.trim()}`;
    if (followersFilter.trim()) finalQuery += ` followers:>=${followersFilter.trim()}`;
    if (reposFilter.trim()) finalQuery += ` repos:>=${reposFilter.trim()}`;
    if (createdFilter.trim()) finalQuery += ` created:>=${createdFilter.trim()}-01-01`;

    if (!finalQuery.trim()) {
        setError(t('githubProfiler.errors.noCriteria', 'Моля, въведете поне един критерий за търсене.'));
        return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedProfile(null); 

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/osint/searchUsers?q=${encodeURIComponent(finalQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSearchResults(res.data.items || []);
      if (res.data.items.length === 0) {
        setError(t('githubProfiler.errors.noUsersFound', 'Не са намерени потребители по тези критерии.'));
      }
    } catch (err) {
      console.error(err);
      setError(t('githubProfiler.errors.searchError', 'Грешка при търсенето. Сървърът не отговаря.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (username) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem("token");
      // Взимаме текущия език от i18n
      const currentLang = i18n.language; 

      const res = await axios.get(`${backendUrl}/osint/analyzeUser`, {
        params: { 
          username: username,
          lang: currentLang // <--- ИЗПРАЩАМЕ ЕЗИКА КЪМ БЕКЕНДА
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProfile(res.data);
    } catch (err) {
      console.error(err);
      
      const backendError = err.response?.data?.error;
      
      if (backendError === 'USER_NOT_FOUND_IN_GITHUB') {
          setError(t('githubProfiler.errors.userNotFoundInGithub', 'Потребителят не беше намерен в GitHub.'));
      } else if (backendError === 'Missing username parameter') {
          setError(t('githubProfiler.errors.missingUsername', 'Липсва параметър username.'));
      } else {
          // Fallback към обща грешка
          setError(t('githubProfiler.errors.analyzeError', 'Грешка при анализирането на {{username}}.', { username }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxActivity = (hoursArray) => Math.max(...(hoursArray || []), 1);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError('');
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/saved-profiles/save`, selectedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); 
    } catch (err) {
      console.error(err);
      
      // Взимаме системния код от бекенда
      const backendError = err.response?.data?.error;
      
      if (backendError === 'PROFILE_ALREADY_SAVED') {
          setSaveError(t('githubProfiler.errors.alreadySaved', 'Този профил вече е запазен.'));
      } else if (backendError === 'MISSING_PROFILE_DATA') {
          setSaveError(t('githubProfiler.errors.missingData', 'Липсват данни за профила.'));
      } else {
          // Fallback към обща грешка за запис
          setSaveError(t('githubProfiler.errors.saveError', 'Грешка при запазване на профила.'));
      }
      
      setTimeout(() => setSaveError(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Хедър и Търсачка */}
        {!selectedProfile && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <FaGithub className="text-6xl text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <h1 className="text-3xl font-black text-white uppercase tracking-widest">{t('githubProfiler.title', 'Дълбочинен GitHub Анализ')}</h1>
              <p className="text-slate-400 mt-2 max-w-xl">
                {t('githubProfiler.subtitle', 'Използвайте филтрите по-долу, за да намерите точния кандидат. Инструментът ще сканира историята му и ще изготви психологически и технически профил чрез AI.')}
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto relative z-10 space-y-4">
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-xl p-2 focus-within:border-blue-500 transition-colors shadow-lg">
                <FaSearch className="text-slate-400 ml-4 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('githubProfiler.searchPlaceholder', 'Име, Фамилия или GitHub Username...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-white p-3 outline-none text-lg placeholder-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={loading || (!searchTerm && !locationFilter && !languageFilter && !followersFilter)}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg transition-all ml-2"
                >
                  {loading ? t('githubProfiler.searchingBtn', 'Търсене...') : t('githubProfiler.searchBtn', 'Търси')}
                </button>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                      <FaFilter /> {t('githubProfiler.filters.title', 'Детайлни филтри')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                          <FaMapMarkerAlt className="text-slate-500 mr-2 shrink-0" />
                          <input type="text" placeholder={t('githubProfiler.filters.location', 'Град (напр. Sofia)')} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-500" />
                      </div>
                      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                          <FaCode className="text-slate-500 mr-2 shrink-0" />
                          <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="bg-transparent w-full outline-none text-sm text-slate-300 cursor-pointer">
                              <option value="">{t('githubProfiler.filters.allLanguages', 'Всички езици')}</option>
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="typescript">TypeScript</option>
                              <option value="c++">C++</option>
                              <option value="c#">C#</option>
                              <option value="ruby">Ruby</option>
                              <option value="go">Go</option>
                              <option value="rust">Rust</option>
                              <option value="php">PHP</option>
                          </select>
                      </div>
                      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                          <FaUsers className="text-slate-500 mr-2 shrink-0" />
                          <select value={followersFilter} onChange={(e) => setFollowersFilter(e.target.value)} className="bg-transparent w-full outline-none text-sm text-slate-300 cursor-pointer">
                              <option value="">{t('githubProfiler.filters.followers', 'Последователи')}</option>
                              <option value="10">{t('githubProfiler.filters.followersActive', '> 10 (Активни)')}</option>
                              <option value="50">{t('githubProfiler.filters.followersPopular', '> 50 (Популярни)')}</option>
                              <option value="100">{t('githubProfiler.filters.followersLeaders', '> 100 (Лидери)')}</option>
                              <option value="500">{t('githubProfiler.filters.followersInfluencers', '> 500 (Инфлуенсъри)')}</option>
                          </select>
                      </div>
                      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                          <FaFolderOpen className="text-slate-500 mr-2 shrink-0" />
                          <select value={reposFilter} onChange={(e) => setReposFilter(e.target.value)} className="bg-transparent w-full outline-none text-sm text-slate-300 cursor-pointer">
                              <option value="">{t('githubProfiler.filters.repos', 'Хранилища')}</option>
                              <option value="10">{t('githubProfiler.filters.repos10', '> 10 проекта')}</option>
                              <option value="30">{t('githubProfiler.filters.repos30', '> 30 проекта')}</option>
                              <option value="50">{t('githubProfiler.filters.repos50', '> 50 проекта')}</option>
                          </select>
                      </div>
                      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                          <FaCalendarAlt className="text-slate-500 mr-2 shrink-0" />
                          <select value={createdFilter} onChange={(e) => setCreatedFilter(e.target.value)} className="bg-transparent w-full outline-none text-sm text-slate-300 cursor-pointer">
                              <option value="">{t('githubProfiler.filters.createdAfter', 'Рег. след')}</option>
                              <option value="2023">{t('githubProfiler.filters.created2023', 'След 2023')}</option>
                              <option value="2020">{t('githubProfiler.filters.created2020', 'След 2020')}</option>
                              <option value="2015">{t('githubProfiler.filters.created2015', 'След 2015')}</option>
                          </select>
                      </div>
                  </div>
              </div>
            </form>

            {error && (
              <div className="mt-6 max-w-3xl mx-auto bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                <FaExclamationTriangle size={20} />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ИЗГЛЕД 1: Списък с резултати */}
        {!selectedProfile && searchResults.length > 0 && !loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-slate-700 flex justify-between items-center">
              <span>{t('githubProfiler.results.title', 'Намерени профили')}</span>
              <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">{t('githubProfiler.results.total', 'Общо')} {searchResults.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <div key={user.id} className="bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden pr-2">
                    <img src={user.avatar_url} alt="avatar" className="w-12 h-12 rounded-full border-2 border-slate-700 shrink-0" />
                    <div className="truncate">
                      <p className="text-white font-bold truncate">{user.login}</p>
                      <a href={user.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline font-mono">
                        {t('githubProfiler.results.githubProfile', 'GitHub Профил')}
                      </a>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAnalyze(user.login)}
                    className="bg-slate-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wider shrink-0"
                  >
                    {t('githubProfiler.results.analyzeBtn', 'Анализ')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && searchResults.length > 0 && !selectedProfile && (
           <div className="text-center text-blue-400 font-bold mt-8 animate-pulse text-xl uppercase tracking-widest flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
             {t('githubProfiler.results.loadingData', 'Извличане на OSINT данни и AI анализ...')} <br/>
             <span className="text-xs text-slate-500 font-normal mt-2">{t('githubProfiler.results.loadingWait', '(Това може да отнеме до 30 секунди)')}</span>
           </div>
        )}

        {/* ИЗГЛЕД 2: ДЕТАЙЛЕН ПРОФИЛ */}
        {selectedProfile && !loading && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <button 
                onClick={() => setSelectedProfile(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-sm tracking-wider bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 w-fit"
                >
                <FaArrowLeft /> {t('githubProfiler.profile.backBtn', 'Назад към резултатите')}
                </button>

                {/* НОВ БУТОН ЗА ЗАПАЗВАНЕ */}
                <div className="flex items-center gap-3">
                    {saveError && <span className="text-red-400 text-xs font-bold bg-red-900/30 px-3 py-1 rounded border border-red-500/30 animate-pulse">{saveError}</span>}
                    {saveSuccess && <span className="text-emerald-400 text-xs font-bold bg-emerald-900/30 px-3 py-1 rounded border border-emerald-500/30 flex items-center gap-1"><FaCheck /> {t('githubProfiler.profile.saved', 'Запазено')}</span>}
                    
                    <PDFExportButton 
                        contentRef={printRef} 
                        fileName={`OSI-HR_Report_${selectedProfile.target}`}
                    />

                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving || saveSuccess}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white transition-colors font-bold uppercase text-sm tracking-wider px-4 py-2 rounded-lg shadow-lg shadow-indigo-900/20"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FaSave />
                        )}
                        {t('githubProfiler.profile.saveBtn', 'Запази Кандидата')}
                    </button>
                </div>
            </div>

            <div ref={contentRef} id="github-report-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 -m-4">
              
              {/* ТОЗИ ХЕДЪР ЩЕ СЕ ВИЖДА САМО В PDF-А */}
              <div className="hidden print:flex lg:col-span-3 justify-between items-center border-b border-slate-700 pb-4 mb-2 w-full">
                  <div className="text-2xl font-black text-blue-500 tracking-tighter">OSI-<span className="text-white">HR</span></div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">INTELLIGENCE REPORT</div>
              </div>
              
              {/* ЛЯВА КОЛОНА */}
              <div className="space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">{t('githubProfiler.profile.targetAcquired', 'Target Acquired')}</div>
                   <h2 className="text-2xl font-black text-white mt-4">{selectedProfile.profile.name || selectedProfile.target}</h2>
                   <a 
                    href={`https://github.com/${selectedProfile.target}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 font-mono text-sm mb-4 hover:text-blue-300 hover:underline transition-colors cursor-pointer inline-block"
                    title={`${t('githubProfiler.profile.openGithub', 'Отвори профила на')} ${selectedProfile.target} в GitHub`}
                  >
                    @{selectedProfile.target}
                  </a>
                   
                   {selectedProfile.profile.bio && <p className="text-slate-400 text-sm italic mb-4">"{selectedProfile.profile.bio}"</p>}
                   
                   <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700 text-sm text-left">
                     {selectedProfile.profile.location && (
                       <div className="flex items-center gap-2 text-slate-300">
                         <FaMapMarkerAlt className="text-red-500 w-4 shrink-0" /> <span>{selectedProfile.profile.location}</span>
                       </div>
                     )}
                     {selectedProfile.profile.company && (
                       <div className="flex items-center gap-2 text-slate-300">
                         <FaBuilding className="text-slate-400 w-4 shrink-0" /> <span>{selectedProfile.profile.company}</span>
                       </div>
                     )}
                   </div>
                </div>

                <div className="bg-slate-800 border border-orange-900/50 rounded-3xl p-6 shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                  <div className="flex items-center gap-3 mb-4">
                    <FaEnvelope className="text-orange-500 text-lg" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.contactsTitle', 'Открити Контакти')}</h3>
                  </div>
                  {selectedProfile.extracted_emails && selectedProfile.extracted_emails.length > 0 ? (
                    <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/30">
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-2">{t('githubProfiler.profile.extractedFromCommits', 'Извлечени от Commit история:')}</p>
                      <ul className="space-y-1">
                        {selectedProfile.extracted_emails.map((email, idx) => (
                          <li key={idx} className="text-orange-300 font-mono text-xs break-all">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center">{t('githubProfiler.profile.noPublicEmails', 'Не са открити публични имейли.')}</p>
                  )}
                </div>

                {/* CROSS-CHECK СКЕНЕР */}
                {selectedProfile.osint_extras?.breach_checks && selectedProfile.osint_extras.breach_checks.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FaUserSecret className="text-red-500 text-lg" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.securityTitle', 'Cross-Check (Сигурност)')}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedProfile.osint_extras.breach_checks.map((check, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-xl border border-slate-700 p-3">
                          <p className="text-white text-xs font-mono font-bold mb-2">{check.email}</p>
                          
                          {check.status === 'clean' && (
                             <div className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-2 rounded-lg border border-green-500/30">
                               {t('githubProfiler.profile.cleanBreach', '✅ Не са намерени изтичания на данни.')}
                             </div>
                          )}

                          {check.status === 'skipped' && (
                             <div className="bg-slate-800 text-slate-400 text-[10px] px-3 py-2 rounded-lg border border-slate-600">
                               {t('githubProfiler.profile.skippedBreach', 'ℹ️ HIBP API ключът липсва. Проверката е пропусната.')}
                             </div>
                          )}

                          {check.status === 'breached' && (
                             <div className="space-y-2">
                               <div className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-2 rounded-lg border border-red-500/30">
                                 {t('githubProfiler.profile.breachFound', '⚠️ Намерени {{count}} изтичания на данни!', { count: check.breaches.length })}
                               </div>
                               <div className="flex flex-wrap gap-1 mt-2">
                                 {check.breaches.slice(0, 6).map((b, i) => (
                                   <span key={i} className="text-[10px] bg-red-900/40 text-red-300 border border-red-800/50 px-2 py-0.5 rounded" title={b.dataClasses?.join(', ')}>
                                     {b.name}
                                   </span>
                                 ))}
                                 {check.breaches.length > 6 && <span className="text-[10px] text-slate-500">{t('githubProfiler.profile.moreBreaches', '+{{count}} още', { count: check.breaches.length - 6 })}</span>}
                               </div>
                             </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Топ Колаборатори */}
                {selectedProfile.osint_extras?.top_collaborators?.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FaUserFriends className="text-blue-500 text-lg" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.topCollaborators', 'Топ Колаборатори')}</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedProfile.osint_extras.top_collaborators.map((collab, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-700">
                          <a href={`https://github.com/${collab.username}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 font-bold hover:underline">
                            @{collab.username}
                          </a>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
                            {collab.commits_together} {t('githubProfiler.profile.commonCommits', 'общи комита')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Използвани Езици */}
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <FaCode className="text-blue-500 text-lg" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.languages', 'Използвани Езици')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(selectedProfile.repositories.map(r => r.language).filter(Boolean))).map(lang => (
                       <span key={lang} className="bg-slate-900 border border-slate-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                         {lang}
                       </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* ДЯСНА КОЛОНА */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* GEMINI AI PROFILING */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-500/20">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                      <FaBrain size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{t('githubProfiler.profile.aiTitle', 'Gemini AI Анализ')}</h3>
                      <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">{t('githubProfiler.profile.aiSubtitle', 'Психологически и Технически Профил')}</p>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed">
                     {selectedProfile.ai_profiling && selectedProfile.ai_profiling !== 'AI_ANALYSIS_UNAVAILABLE' ? (
                       typeof selectedProfile.ai_profiling === 'object' ? (
                         <div className="space-y-5">
                            {selectedProfile.ai_profiling.primary_role && (
                                <div className="flex items-center gap-3">
                                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{t('githubProfiler.profile.role', 'Предполагаема роля:')}</span>
                                    <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-lg font-black text-sm uppercase tracking-wider">
                                        {selectedProfile.ai_profiling.primary_role}
                                    </span>
                                </div>
                            )}

                            {selectedProfile.ai_profiling.employer_summary && (
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-indigo-500/20">
                                    <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                                        {t('githubProfiler.profile.employerSummary', '💼 Резюме за работодатели')}
                                    </h4>
                                    <p className="text-sm text-slate-300">{selectedProfile.ai_profiling.employer_summary}</p>
                                </div>
                            )}

                            {selectedProfile.ai_profiling.activity_evaluation && (
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-indigo-500/20">
                                    <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                                        {t('githubProfiler.profile.activityEval', '📊 Оценка на активността')}
                                    </h4>
                                    <p className="text-sm text-slate-300">{selectedProfile.ai_profiling.activity_evaluation}</p>
                                </div>
                            )}

                            {selectedProfile.ai_profiling.tech_stack && Array.isArray(selectedProfile.ai_profiling.tech_stack) && (
                                <div>
                                    <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3">{t('githubProfiler.profile.techStack', 'Разпознати компетенции:')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.ai_profiling.tech_stack.map((tech, idx) => (
                                            <span key={idx} className="bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-md">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProfile.ai_profiling.most_likely_email && (
                                <div className="mt-4 flex items-center justify-between bg-orange-500/10 p-3 rounded-xl border border-orange-500/30">
                                    <span className="text-orange-400 font-bold uppercase tracking-widest text-[10px]">{t('githubProfiler.profile.aiEmailGuess', 'AI Извод за контакт:')}</span>
                                    <span className="text-orange-300 font-mono text-sm font-bold">{selectedProfile.ai_profiling.most_likely_email}</span>
                                </div>
                            )}
                         </div>
                       ) : (
                         selectedProfile.ai_profiling.split('\n').map((line, i) => (
                           <p key={i} className="mb-2">{line}</p>
                         ))
                       )
                     ) : (
                       <p className="italic text-slate-500">{t('githubProfiler.profile.aiNotAvailable', 'AI Анализът не е наличен в момента.')}</p>
                     )}
                  </div>
                </div>

                {/* Графика на активността */}
                {selectedProfile.osint_extras?.activity_by_hour && (
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <FaChartBar className="text-indigo-500 text-lg" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.dailyActivity', 'Дневна Активност')}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-end h-32 gap-1 mt-6 border-b border-slate-700 pb-2">
                      {selectedProfile.osint_extras.activity_by_hour.map((count, hr) => {
                        const max = getMaxActivity(selectedProfile.osint_extras.activity_by_hour);
                        const height = max > 0 ? (count / max) * 100 : 0;
                        return (
                          <div key={hr} className="flex-1 flex flex-col justify-end group relative h-full">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                              {hr}:00 - {count}
                            </div>
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500 ${count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-800/50'}`} 
                              style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                            ></div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-1 mt-2">
                      {selectedProfile.osint_extras.activity_by_hour.map((_, hr) => (
                        <div key={`label-${hr}`} className="flex-1 flex justify-center">
                          <span className="text-[8px] text-slate-500 font-mono">
                            {hr % 4 === 0 ? hr : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gist Scanner */}
                {selectedProfile.osint_extras?.gists?.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FaUserSecret className="text-red-500 text-lg" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('githubProfiler.profile.gistScanner', 'Gist Скенер (Тайни и Конфигурации)')}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {selectedProfile.osint_extras.gists.map((gist, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center ${gist.flagged_as_secret ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-900 border-slate-700'}`}>
                           <div className="overflow-hidden pr-4">
                             <div className="flex gap-2 flex-wrap mb-1">
                                {gist.files.map(file => (
                                  <span key={file} className={`text-xs font-mono truncate ${gist.flagged_as_secret ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                    {file}
                                  </span>
                                ))}
                             </div>
                             {gist.flagged_as_secret && (
                               <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase font-black tracking-widest">{t('githubProfiler.profile.potentialLeak', 'Потенциално изтичане на данни')}</span>
                             )}
                           </div>
                           <a href={gist.url} target="_blank" rel="noreferrer" className={`text-xs px-3 py-1 rounded-lg font-bold shrink-0 transition-colors ${gist.flagged_as_secret ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                             {t('githubProfiler.profile.viewGist', 'Преглед')}
                           </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Списък с хранилища */}
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">{t('githubProfiler.profile.scannedRepos', 'Последно сканирани хранилища')} ({selectedProfile.repositories.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {selectedProfile.repositories.slice(0, 10).map((repo, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex flex-col justify-between">
                         <span className="font-bold text-blue-400 text-sm truncate">{repo.name}</span>
                         <span className="text-xs text-slate-500 mt-1 truncate">{repo.description || t('githubProfiler.profile.noDescription', 'Няма описание')}</span>
                         {repo.language && <span className="text-[10px] bg-slate-800 text-slate-300 w-fit px-2 py-0.5 rounded mt-2">{repo.language}</span>}
                      </div>
                    ))}
                  </div>
                  {selectedProfile.repositories.length > 10 && (
                    <p className="text-center text-xs text-slate-500 mt-4 italic">{t('githubProfiler.profile.showingTop10', '*Показани са първите 10. AI-а е анализирал всички.')}</p>
                  )}
                </div>

              </div>

              {/* НОВО: ТОЗИ ФУТЪР СЕ ПОКАЗВА САМО В PDF-А */}
              <div className="hidden print:flex flex-col items-end mt-8 pt-4 border-t border-slate-700 w-full text-sm font-bold text-slate-400 lg:col-span-3">
                  <p>{t('githubProfiler.profile.pdfGeneratedBy', 'Докладът е генериран автоматично от OSI-HR Intelligence Engine')}</p>
                  <p className="text-indigo-400">{t('githubProfiler.profile.expert', 'Експерт:')} {currentUser?.name || t('githubProfiler.profile.admin', 'Администратор')} | {t('githubProfiler.profile.date', 'Дата:')} {new Date().toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : 'en-US')}</p>
              </div>

            </div>
          </div>
        )}

      </div>
      
      {selectedProfile && (
        <div style={{ display: 'none' }}>
           <PrintableReport ref={printRef} profile={selectedProfile} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default GitHubProfiler;