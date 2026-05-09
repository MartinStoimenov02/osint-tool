import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const PDFExportButton = ({ contentRef, fileName = "OSI-HR_Report", buttonText }) => {
    const { t } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ
    
    const handlePrint = useReactToPrint({
        // Поддържа и новият, и старият синтаксис на библиотеката:
        contentRef: contentRef, 
        content: () => contentRef.current,
        documentTitle: fileName,
        pageStyle: `
            @page { size: A4 portrait; margin: 15mm; }
            @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        `
    });

    // Динамично оценяване на стойността по подразбиране чрез i18next
    const displayText = buttonText || t('common.exportPdf', 'Експорт в PDF');

    return (
        <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white transition-colors font-bold uppercase text-sm tracking-wider px-4 py-2 rounded-lg border border-slate-600 shadow-lg"
        >
            <FaFilePdf className="text-red-400" />
            {displayText}
        </button>
    );
};

export default PDFExportButton;