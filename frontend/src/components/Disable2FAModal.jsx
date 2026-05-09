import React from "react";
import { useTranslation } from "react-i18next";

const Disable2FAModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <h3 className="text-xl font-bold text-white mb-2 text-center uppercase tracking-widest">
          {t('profile.security.title', 'Сигурност')}
        </h3>
        <p className="text-slate-300 text-sm text-center mb-8">
          {t('profile.confirmDisable2FA', "Сигурни ли сте, че искате да изключите двуфакторната защита? Акаунтът ви ще бъде по-уязвим.")}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {t('common.cancel', 'Отказ')}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all"
          >
            {isLoading ? "..." : t('profile.security.disableBtn', 'Изключи')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disable2FAModal;