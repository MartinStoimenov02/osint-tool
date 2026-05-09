import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaQuestionCircle, 
  FaGithub, 
  FaShieldAlt, 
  FaKey, 
  FaEnvelope, 
  FaSearch, 
  FaBuilding, 
  FaFingerprint, 
  FaFolderOpen, 
  FaFilePdf,
  FaGlobe 
} from "react-icons/fa";

const Help = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        
        <div className="bg-slate-700/30 p-8 flex flex-col items-center border-b border-slate-700 text-center">
          <div className="text-6xl text-blue-500 mb-4">
            <FaQuestionCircle />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">{t('helpCenter.title')}</h2>
          <p className="text-slate-400 mt-2">{t('helpCenter.subtitle')}</p>
        </div>

        <div className="p-8 space-y-6">
          
          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaSearch className="text-blue-400" /> 
              {t('helpCenter.q1.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q1.desc')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaGithub className="text-blue-400" /> 
              {t('helpCenter.q2.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              {t('helpCenter.q2.desc')}
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 ml-2">
              <li><strong>{t('helpCenter.q2.li1_bold')}</strong> {t('helpCenter.q2.li1_text')}</li>
              <li><strong>{t('helpCenter.q2.li2_bold')}</strong> {t('helpCenter.q2.li2_text')}</li>
              <li><strong>{t('helpCenter.q2.li3_bold')}</strong> {t('helpCenter.q2.li3_text')}</li>
              <li><strong>{t('helpCenter.q2.li4_bold')}</strong> {t('helpCenter.q2.li4_text')}</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaBuilding className="text-blue-400" /> 
              {t('helpCenter.q3.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q3.desc_p1')}
              <strong>{t('helpCenter.q3.desc_bold')}</strong>
              {t('helpCenter.q3.desc_p2')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaFingerprint className="text-blue-400" /> 
              {t('helpCenter.q4.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q4.desc_p1')}
              <strong>{t('helpCenter.q4.desc_bold')}</strong>
              {t('helpCenter.q4.desc_p2')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaFolderOpen className="text-blue-400" /> 
              {t('helpCenter.q5.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q5.desc_p1')}
              <strong>{t('helpCenter.q5.desc_bold1')}</strong>
              {t('helpCenter.q5.desc_p2')}
              <strong className="inline-flex items-center gap-1"><FaFilePdf className="text-red-400"/> {t('helpCenter.q5.desc_bold2')}</strong>
              {t('helpCenter.q5.desc_p3')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaGlobe className="text-blue-400" /> 
              {t('helpCenter.q6.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q6.desc_p1')}
              <strong>{t('helpCenter.q6.desc_bold1')}</strong>
              {t('helpCenter.q6.desc_p2')}
              <strong>{t('helpCenter.q6.desc_bold2')}</strong>
              {t('helpCenter.q6.desc_p3')}
              <strong>{t('helpCenter.q6.desc_bold3')}</strong>
              {t('helpCenter.q6.desc_p4')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaShieldAlt className="text-blue-400" /> 
              {t('helpCenter.q7.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q7.desc_p1')}
              <strong>{t('helpCenter.q7.desc_bold1')}</strong>
              {t('helpCenter.q7.desc_p2')} <br/><br/>
              <span className="text-red-400 font-bold">{t('helpCenter.q7.warning_label')}</span>
              {t('helpCenter.q7.warning_text')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaKey className="text-blue-400" /> 
              {t('helpCenter.q8.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q8.desc_p1')}
              <strong>{t('helpCenter.q8.desc_bold')}</strong>
              {t('helpCenter.q8.desc_p2')}
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaEnvelope className="text-blue-400" /> 
              {t('helpCenter.q9.title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('helpCenter.q9.desc_p1')}
              <a href="mailto:martinstoimenov02@gmail.com" className="text-blue-400 hover:underline">
                martinstoimenov02@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Help;