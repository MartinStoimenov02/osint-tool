import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-slate-800 border border-red-900/50 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(220,38,38,0.15)] relative animate-in fade-in zoom-in duration-200">
        
        {/* Бутон за затваряне (X) горе вдясно */}
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors" 
          onClick={onCancel}
        >
          <FaTimes size={18} />
        </button>

        {/* Икона и Заглавие */}
        <div className="flex flex-col items-center text-center mb-6 mt-2">
          <div className="bg-red-900/30 p-4 rounded-full text-red-500 mb-4 border border-red-900/50">
            <FaExclamationTriangle size={28} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {t('confirmDelete.title', 'Потвърждение')}
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            {t('confirmDelete.text', 'Сигурни ли сте, че искате да изтриете тези данни? Това действие е необратимо.')}
          </p>
        </div>

        {/* Бутони за действие */}
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors" 
            onClick={onCancel}
          >
            {t('common.cancel', 'Отказ')}
          </button>
          <button 
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-colors" 
            onClick={onConfirm}
          >
            {t('confirmDelete.confirmBtn', 'Да, изтрий')}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;