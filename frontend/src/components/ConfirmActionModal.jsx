import React from "react";
import { FaExclamationTriangle, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Проверяваме дали действието е "Одобрение" (approve) или "Отхвърляне" (reject)
  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className={`bg-slate-800 border ${isApprove ? 'border-green-900/50' : 'border-red-900/50'} rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200`}>
        
        {/* Бутон за затваряне (X) горе вдясно */}
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors" 
          onClick={onClose}
        >
          <FaTimes size={18} />
        </button>

        {/* Икона и Заглавие */}
        <div className="flex flex-col items-center text-center mb-6 mt-2">
          <div className={`${isApprove ? 'bg-green-900/30 text-green-500 border-green-900/50' : 'bg-red-900/30 text-red-500 border-red-900/50'} p-4 rounded-full mb-4 border`}>
            {isApprove ? <FaCheckCircle size={28} /> : <FaExclamationTriangle size={28} />}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {t('confirmAction.title', 'Потвърждение')}
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            {isApprove 
              ? t('confirmAction.approveText', 'Сигурни ли сте, че искате да одобрите този потребител и да му дадете достъп?') 
              : t('confirmAction.rejectText', 'Сигурни ли сте, че искате да отхвърлите и изтриете тази заявка? Това действие е необратимо.')}
          </p>
        </div>

        {/* Бутони за действие */}
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors" 
            onClick={onClose}
          >
            {t('common.cancel', 'Отказ')}
          </button>
          <button 
            className={`flex-1 text-white font-bold py-3 rounded-lg shadow-lg transition-colors ${isApprove ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`} 
            onClick={onConfirm}
          >
            {isApprove ? t('confirmAction.approveBtn', 'Да, одобри') : t('confirmAction.rejectBtn', 'Да, отхвърли')}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ConfirmActionModal;