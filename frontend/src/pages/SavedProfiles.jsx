import React, { useState, useEffect, useRef } from 'react';
import PrintableReport from '../components/PrintableReport';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import { 
  FaFolderOpen, FaTrash, FaGithub, FaMapMarkerAlt, 
  FaEnvelope, FaBrain, FaExternalLinkAlt, FaArrowLeft,
  FaChartBar, FaUserSecret, FaUserFriends, FaCode, FaBuilding
} from 'react-icons/fa';

import PDFExportButton from '../components/PDFExportButton';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const SavedProfiles = () => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const contentRef = useRef(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedProfile, setSelectedProfile] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const currentUser = useSelector((state) => state.user.user);

  const printRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/saved-profiles/my-profiles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(res.data.profiles || []);
    } catch (err) {
      console.error(err);
      
      const backendError = err.response?.data?.error;
      
      if (backendError === 'SERVER_ERROR_FETCHING') {
          setError(t('savedProfiles.errors.fetchError', "Грешка при зареждане на запазените профили."));
      } else {
          setError(t('common.error', "Възникна неочаквана грешка!"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, target) => {
    e.stopPropagation();
    if (!window.confirm(t('savedProfiles.errors.deleteConfirm', "Сигурни ли сте, че искате да премахнете досието на {{target}}?", { target }))) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/saved-profiles/delete/${target}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(profiles.filter(p => p.target !== target));
      if (selectedProfile?.target === target) setSelectedProfile(null);
    } catch (err) {
      console.error(err);
      
      const backendError = err.response?.data?.error;
      
      if (backendError === 'PROFILE_NOT_FOUND') {
          alert(t('savedProfiles.errors.notFound', "Профилът не беше намерен."));
      } else if (backendError === 'SERVER_ERROR_DELETING') {
          alert(t('savedProfiles.errors.deleteError', "Възникна сървърна грешка при изтриването."));
      } else {
          alert(t('common.error', "Възникна неочаквана грешка!"));
      }
    }
  };

  const getMaxActivity = (hoursArray) => Math.max(...(hoursArray || []), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* АКО НЯМА ИЗБРАН ПРОФИЛ - ПОКАЗВАМЕ СПИСЪКА */}
        {!selectedProfile ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-400">
                  <FaFolderOpen size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-widest">{t('savedProfiles.title', 'Запазени Досиета')}</h1>
                  <p className="text-slate-400 text-sm">{t('savedProfiles.subtitle', 'Вашият личен списък с анализирани кандидати ({{count}})', { count: profiles.length })}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            {profiles.length === 0 && !error ? (
              <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                <FaFolderOpen className="mx-auto text-6xl text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">{t('savedProfiles.noProfiles', 'Нямате запазени кандидати')}</h3>
                <p className="text-slate-500 mt-2">{t('savedProfiles.noProfilesDesc', 'Отидете в GitHub Profiler, за да анализирате и запазите профили.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {profiles.map((doc) => (
                  <div 
                    key={doc._id} 
                    onClick={() => setSelectedProfile(doc)}
                    className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:scale-[1.02] group"
                  >
                    
                    {/* Досие Хедър */}
                    <div className="p-5 border-b border-slate-700 bg-slate-800/80 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={(e) => handleDelete(e, doc.target)} className="text-slate-500 hover:text-red-400 transition-colors p-2" title={t('savedProfiles.deleteProfileTitle', "Изтрий досието")}>
                           <FaTrash />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 pr-12">
                        <img 
                        src={`https://github.com/${doc.target}.png`} 
                        alt="avatar" 
                        onError={(e) => { e.target.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }}
                        className="w-14 h-14 rounded-full border-2 border-indigo-500/50 object-cover" 
                        />                        
                        <div className="truncate">
                          <h2 className="font-black text-lg text-white truncate">{doc.profile?.name || doc.target}</h2>
                          <p className="text-indigo-400 font-mono text-xs flex items-center gap-1">
                            <FaGithub /> @{doc.target}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Досие Тяло */}
                    <div className="p-5 flex-grow space-y-4">
                      {/* AI Роля */}
                      {doc.ai_profiling?.primary_role && (
                        <div className="flex items-start gap-2">
                          <FaBrain className="text-indigo-500 mt-1 shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{t('savedProfiles.aiProfile', 'AI Профил')}</span>
                            <span className="text-sm text-slate-200 font-bold">{doc.ai_profiling.primary_role}</span>
                          </div>
                        </div>
                      )}

                      {/* Контакти */}
                      {doc.extracted_emails && doc.extracted_emails.length > 0 && (
                        <div className="flex items-start gap-2">
                          <FaEnvelope className="text-orange-500 mt-1 shrink-0" />
                          <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{t('savedProfiles.foundEmails', 'Открити Имейли')}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                               {doc.extracted_emails.slice(0, 2).map((email, i) => (
                                 <span key={i} className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded truncate max-w-full">
                                   {email}
                                 </span>
                               ))}
                               {doc.extracted_emails.length > 2 && <span className="text-xs text-slate-500">+{doc.extracted_emails.length - 2}</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Локация */}
                      {doc.profile?.location && (
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{t('savedProfiles.location', 'Локация')}</span>
                            <span className="text-sm text-slate-300">{doc.profile.location}</span>
                          </div>
                        </div>
                      )}

                      {/* Умения (Технологии) */}
                      {doc.ai_profiling?.tech_stack && doc.ai_profiling.tech_stack.length > 0 && (
                         <div className="pt-2">
                            <div className="flex flex-wrap gap-1">
                              {doc.ai_profiling.tech_stack.slice(0, 4).map((tech, i) => (
                                <span key={i} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-600 px-2 py-1 rounded-md font-bold">
                                  {tech}
                                </span>
                              ))}
                              {doc.ai_profiling.tech_stack.length > 4 && (
                                <span className="text-[10px] text-slate-500 py-1">{t('savedProfiles.andMore', 'и още...')}</span>
                              )}
                            </div>
                         </div>
                      )}
                    </div>

                    {/* Досие Футър */}
                    <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/50 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                      <span className="text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">{t('savedProfiles.viewDetails', 'Виж детайли →')}</span>
                      <span>{new Date(doc.savedAt).toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : 'en-US')}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ДЕТАЙЛЕН ИЗГЛЕД - ТОЧНО КОПИЕ ОТ GITHUBPROFILER.JSX (Преизползваме преводите от там) */
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <button 
                onClick={() => setSelectedProfile(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-sm tracking-wider bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 w-fit"
                >
                <FaArrowLeft /> {t('githubProfiler.profile.backBtn', 'Назад към резултатите')}
                </button>

                <div className="flex items-center gap-3">
                    <PDFExportButton 
                        contentRef={printRef} 
                        fileName={`OSI-HR_Report_${selectedProfile.target}`}
                    />
                    
                    <button 
                        onClick={(e) => handleDelete(e, selectedProfile.target)}
                        className="flex items-center gap-2 bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-red-400 transition-colors font-bold uppercase text-sm tracking-wider px-4 py-2 rounded-lg shadow-lg"
                    >
                        <FaTrash /> {t('common.delete', 'Изтрий')}
                    </button>
                </div>
            </div>

            <div ref={contentRef} id="saved-report-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 -m-4">
              
              {/* ТОЗИ ХЕДЪР ЩЕ СЕ ВИЖДА САМО В PDF-А */}
              <div className="hidden print:flex lg:col-span-3 justify-between items-center border-b border-slate-700 pb-4 mb-2 w-full">
                  <div className="text-2xl font-black text-blue-500 tracking-tighter">OSI-<span className="text-white">HR</span></div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">ARCHIVED INTELLIGENCE REPORT</div>
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
                    {Array.from(new Set(selectedProfile.repositories?.map(r => r.language).filter(Boolean) || [])).map(lang => (
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
                      <div className="flex items-center gap-3 text-indigo-500">
                        <FaChartBar className="text-lg" />
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
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">{t('githubProfiler.profile.scannedRepos', 'Последно сканирани хранилища')} ({selectedProfile.repositories?.length || 0})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {selectedProfile.repositories?.slice(0, 10).map((repo, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex flex-col justify-between">
                         <span className="font-bold text-blue-400 text-sm truncate">{repo.name}</span>
                         <span className="text-xs text-slate-500 mt-1 truncate">{repo.description || t('githubProfiler.profile.noDescription', 'Няма описание')}</span>
                         {repo.language && <span className="text-[10px] bg-slate-800 text-slate-300 w-fit px-2 py-0.5 rounded mt-2">{repo.language}</span>}
                      </div>
                    ))}
                  </div>
                  {selectedProfile.repositories?.length > 10 && (
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

      {/* НОВО: СКРИТИЯТ КОМПОНЕНТ ЗА ПРИНТИРАНЕ */}
      {selectedProfile && (
        <div style={{ display: 'none' }}>
           <PrintableReport ref={printRef} profile={selectedProfile} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default SavedProfiles;