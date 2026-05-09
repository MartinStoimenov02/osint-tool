import React from 'react';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const Footer = () => {
  const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-center p-4 mt-auto">
      <p>&copy; 2026 OSI-HR - {t('footer.rights', 'Всички права запазени.')}</p>
    </footer>
  );
}

export default Footer;