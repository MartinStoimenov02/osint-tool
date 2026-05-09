import React, { forwardRef } from 'react';
import { FaGithub, FaMapMarkerAlt, FaBuilding, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const PrintableReport = forwardRef(({ profile, currentUser }, ref) => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  if (!profile) return null;

  const p = profile.profile || {};
  const ai = profile.ai_profiling || {};
  const osint = profile.osint_extras || {};
  const repos = profile.repositories || [];
  
  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));

  // Форматираме датата спрямо избрания език
  const dateStr = new Date().toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : 'en-US');

  return (
    <div ref={ref} className="bg-white text-slate-900 font-sans p-10 max-w-4xl mx-auto">
      
      {/* ХЕДЪР */}
      <div className="flex items-start border-b-2 border-slate-200 pb-6 mb-8 break-inside-avoid">
        <img 
          src={`https://github.com/${profile.target}.png`} 
          alt="Avatar" 
          onError={(e) => { e.target.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }}
          className="w-24 h-24 rounded-2xl border-4 border-slate-100 object-cover shadow-sm mr-6" 
        />
        
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{p.name || profile.target}</h1>
          <div className="flex items-center gap-2 mt-1 mb-2">
            <FaGithub className="text-slate-400" />
            <span className="text-base text-blue-600 font-mono font-bold">@{profile.target}</span>
          </div>
          
          {ai.primary_role && (
            <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-black uppercase tracking-widest border border-slate-200">
              {ai.primary_role}
            </span>
          )}
          {p.bio && <p className="text-sm text-slate-600 mt-2 italic">"{p.bio}"</p>}
        </div>

        <div className="text-right text-sm text-slate-600 space-y-1.5 flex flex-col items-end">
          {p.location && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-slate-400"/> {p.location}</div>}
          {p.company && <div className="flex items-center gap-2"><FaBuilding className="text-slate-400"/> {p.company}</div>}
          {ai.most_likely_email && <div className="flex items-center gap-2 font-bold text-blue-600"><FaEnvelope className="text-blue-400"/> {ai.most_likely_email}</div>}
        </div>
      </div>

      {/* ТЯЛО */}
      <div className="flex flex-row gap-10">
        
        {/* ЛЯВА КОЛОНА */}
        <div className="w-1/3 flex flex-col gap-8">
          
          {ai.tech_stack && ai.tech_stack.length > 0 && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                {t('printableReport.competencies', 'Компетенции')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {ai.tech_stack.map((tech, idx) => (
                  <span key={idx} className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-100">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                {t('printableReport.languages', 'Езици')}
              </h3>
              <div className="flex flex-wrap gap-1">
                {languages.map(lang => (
                  <span key={lang} className="text-[11px] text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {osint.breach_checks && osint.breach_checks.length > 0 && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                {t('printableReport.security', 'Сигурност (Cross-Check)')}
              </h3>
              <div className="space-y-3">
                {osint.breach_checks.map((check, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="font-mono font-bold text-slate-700 truncate" title={check.email}>{check.email}</p>
                    {check.status === 'clean' && <div className="text-emerald-600 flex items-center gap-1 mt-1"><FaCheckCircle/> {t('printableReport.clean', 'Чист')}</div>}
                    {check.status === 'breached' && <div className="text-red-600 flex items-center gap-1 mt-1"><FaExclamationTriangle/> {check.breaches.length} {t('printableReport.breaches', 'изтичания')}</div>}
                    {check.status === 'skipped' && <div className="text-slate-400 mt-1">{t('printableReport.skipped', 'Пропусната проверка')}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ДЯСНА КОЛОНА */}
        <div className="w-2/3 flex flex-col gap-8">
          
          {ai.employer_summary && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                {t('printableReport.aiSummary', 'Професионално Резюме (AI)')}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{ai.employer_summary}</p>
            </div>
          )}

          {ai.activity_evaluation && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                {t('printableReport.activityEvaluation', 'Оценка на Активността')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{ai.activity_evaluation}</p>
            </div>
          )}

          {repos.length > 0 && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                {t('printableReport.significantProjects', 'Значими Проекти')} ({repos.length})
              </h3>
              <div className="space-y-3">
                {repos.slice(0, 6).map((repo, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm break-inside-avoid">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-blue-600 text-sm">{repo.name}</p>
                      {repo.language && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{repo.language}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {repo.description || t('printableReport.noDescription', 'Няма описание към проекта.')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ФУТЪР */}
      <div className="mt-12 pt-6 border-t-2 border-slate-200 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold break-inside-avoid">
        <div>OSI-HR <span className="text-blue-500">Intelligence Engine</span></div>
        <div>
          {t('printableReport.expert', 'Експерт:')} <span className="text-slate-700">{currentUser?.name || t('printableReport.admin', 'Администратор')}</span> | {dateStr} {i18n.language === 'bg' ? 'г.' : ''}
        </div>
      </div>

    </div>
  );
});

export default PrintableReport;