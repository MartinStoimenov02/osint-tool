import React from 'react';
import { FaQuestionCircle, FaGithub, FaShieldAlt, FaKey, FaEnvelope, FaSearch } from "react-icons/fa";

const Help = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        
        <div className="bg-slate-700/30 p-8 flex flex-col items-center border-b border-slate-700 text-center">
          <div className="text-6xl text-blue-500 mb-4">
            <FaQuestionCircle />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">Помощен център</h2>
          <p className="text-slate-400 mt-2">Често задавани въпроси за работа с OSI-HR</p>
        </div>

        <div className="p-8 space-y-6">
          
          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaSearch className="text-blue-400" /> 
              Какво представлява OSI-HR?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Това е специализирана платформа, предназначена за HR специалисти, хедхънтъри и експерти по корпоративна сигурност. Тя автоматизира събирането и анализа на публична информация (Open Source Intelligence), за да ви помогне да профилирате ИТ кандидати и да проучвате технологични компании.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaGithub className="text-blue-400" /> 
              Как работи Дълбочинният GitHub Анализ?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              В секцията за инструменти можете да търсите разработчици по тяхното потребителско име. Системата автоматично анализира техните публични хранилища, езици за програмиране, активност и реален технологичен стек, спестявайки ви часове ръчно проучване.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaShieldAlt className="text-blue-400" /> 
              Как да повиша сигурността на акаунта си?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Силно препоръчваме да включите <strong>Двуфакторна автентикация (2FA)</strong>. Отидете във вашия "Профил", намерете секцията "Сигурност" и сканирайте QR кода с приложение като Google Authenticator. <br/><br/>
              <span className="text-red-400 font-bold">Важно:</span> Не забравяйте да запазите своите Recovery (възстановителни) кодове при настройката, в случай че изгубите достъп до телефона си!
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaKey className="text-blue-400" /> 
              Забравих си паролата. Какво да правя?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              На страницата за вход кликнете върху линка <strong>„Забравена парола?“</strong>. Въведете своя имейл адрес и ще получите 6-цифрен код за верификация, с който да възстановите достъпа си до системата.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
              <FaEnvelope className="text-blue-400" /> 
              Как мога да дам обратна връзка или да се свържа с екипа?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Можете да използвате бутона <strong>"Обратна връзка"</strong> директно във вашия Профил, за да ни изпратите бързо съобщение. За по-сериозни въпроси и партньорства, пишете ни на <a href="mailto:martinstoimenov02@gmail.com" className="text-blue-400 hover:underline">martinstoimenov02@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Help;