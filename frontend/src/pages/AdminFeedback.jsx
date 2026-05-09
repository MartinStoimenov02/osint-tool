import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaFilter, FaSort, FaTrashAlt } from 'react-icons/fa';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const feedbackTypeOptions = [
  'Всички',
  'Доклад за грешка',
  'Предложение',
  'Жалба',
  'Обща обратна връзка',
  'Помощ и въпроси'
];

const AdminFeedback = () => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [feedbackList, setFeedbackList] = useState([]);
  const [selectAll, setSelectAll] = useState(false); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState('Всички');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // КОРЕКЦИЯ ЗА VITE
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`${backendUrl}/feedback/getAllFeedback`);
      setFeedbackList(res.data.feedback || res.data);
    } catch (err) {
      const backendError = err.response?.data?.error;
      if (backendError === 'ERROR_FETCHING_FEEDBACK') {
         console.error(t('adminFeedback.errors.fetchFailed', 'Грешка при зареждането на обратната връзка'));
      } else {
         console.error('Error fetching feedback:', err);
      }
    }
  };

  useEffect(() => {
    fetchFeedback();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // ДОБАВЕН ПРАЗЕН МАСИВ [], ЗА ДА НЕ СЕ ИЗПЪЛНЯВА ПРИ ВСЕКИ РЕНДЪР

  const confirmDelete = async () => {
    try {
      if (Array.isArray(deleteTargetId)) {
        const filteredSelectedIds = selectedIds.filter((id) => {
          const feedback = feedbackList.find((f) => (f._id || f.id) === id);
          return filterType === 'Всички' || feedback.feedbackType === filterType;
        });
    
        if (filteredSelectedIds.length > 0) {
          await axios.post(`${backendUrl}/feedback/deleteMultipleFeedback`, {
            ids: filteredSelectedIds,
          });
          setSelectedIds([]); 
          setSelectAll(false);  
        }
      } else {
        await axios.delete(`${backendUrl}/feedback/deleteFeedbackById/${deleteTargetId}`);
      }
      fetchFeedback();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      
      const backendError = err.response?.data?.error;
      
      if (backendError === 'ERROR_DELETING_MULTIPLE_FEEDBACK') {
          alert(t('adminFeedback.errors.deleteMultipleFailed', 'Грешка при групово изтриване.'));
      } else if (backendError === 'ERROR_DELETING_FEEDBACK') {
          alert(t('adminFeedback.errors.deleteFailed', 'Грешка при изтриване на записа.'));
      } else {
          alert(t('common.error', 'Възникна неочаквана грешка!'));
      }
    } finally {
      closeDeleteModal();
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]); 
    } else {
      const filteredIds = feedbackList
        .filter(fb => filterType === 'Всички' || fb.feedbackType === filterType)
        .map(fb => fb._id || fb.id);
      setSelectedIds(filteredIds);
    }
    setSelectAll(!selectAll); 
  };  

  const openDeleteModal = (idOrIds) => {
    setDeleteTargetId(idOrIds);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filtered = feedbackList
    .filter((f) => filterType === 'Всички' || f.feedbackType === filterType)
    .sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'rating') return factor * (a.rating - b.rating);
      if (sortKey === 'feedbackType') return factor * a.feedbackType.localeCompare(b.feedbackType);
      return factor * (new Date(a.createdAt) - new Date(b.createdAt));
    });

  // Помощна функция за превод на типовете обратна връзка
  const translateType = (type) => {
    switch (type) {
      case 'Всички': return t('adminFeedback.all', 'Всички');
      case 'Доклад за грешка': return t('feedbackModal.options.bugReport', 'Доклад за грешка');
      case 'Предложение': return t('feedbackModal.options.suggestion', 'Предложение');
      case 'Жалба': return t('feedbackModal.options.complaint', 'Жалба');
      case 'Обща обратна връзка': return t('feedbackModal.options.general', 'Обща обратна връзка');
      case 'Помощ и въпроси': return t('feedbackModal.options.help', 'Помощ и въпроси');
      default: return type;
    }
  };

  // Помощна функция за локализиране на датата
  const formatDate = (dateString, isMobileView = false) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 'en-US';
    return isMobileView ? date.toLocaleDateString(locale) : date.toLocaleString(locale);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <FaFilter className="text-blue-500" /> {t('adminFeedback.title', 'Обратна връзка')}
            </h1>
            {selectedIds.length > 0 && (
              <button 
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all animate-pulse"
                onClick={() => openDeleteModal(selectedIds)}
              >
                <FaTrashAlt /> {t('common.delete', 'Изтрий')} ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('adminFeedback.filter', 'Филтър')}</label>
              <select className="bg-slate-900 border border-slate-700 rounded-lg p-2 outline-none focus:border-blue-500" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                {feedbackTypeOptions.map((type) => (
                  <option key={type} value={type}>{translateType(type)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('adminFeedback.sortBy', 'Сортирай по')}</label>
              <select className="bg-slate-900 border border-slate-700 rounded-lg p-2 outline-none focus:border-blue-500" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="createdAt">{t('adminFeedback.date', 'Дата')}</option>
                <option value="rating">{t('adminFeedback.rating', 'Оценка')}</option>
                <option value="feedbackType">{t('adminFeedback.type', 'Тип')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('adminFeedback.order', 'Ред')}</label>
              <select className="bg-slate-900 border border-slate-700 rounded-lg p-2 outline-none focus:border-blue-500" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">{t('adminFeedback.newestFirst', 'Най-нови първо')}</option>
                <option value="asc">{t('adminFeedback.oldestFirst', 'Най-стари първо')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        {!isMobile ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="accent-blue-500" checked={selectAll} onChange={toggleSelectAll} />
                  </th>
                  <th className="p-4">{t('adminFeedback.table.user', 'Потребител')}</th>
                  <th className="p-4">{t('adminFeedback.table.type', 'Тип')}</th>
                  <th className="p-4">{t('adminFeedback.table.message', 'Съобщение')}</th>
                  <th className="p-4 text-center">{t('adminFeedback.table.rating', 'Оценка')}</th>
                  <th className="p-4">{t('adminFeedback.table.date', 'Дата')}</th>
                  <th className="p-4 text-right">{t('adminFeedback.table.actions', 'Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((fb) => {
                  const id = fb._id || fb.id;
                  return (
                    <tr key={id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-center">
                        <input type="checkbox" className="accent-blue-500" checked={selectedIds.includes(id)} onChange={() => toggleSelect(id)} />
                      </td>
                      <td className="p-4 font-medium text-slate-300">{fb.user?.email || t('adminFeedback.anonymous', 'Анонимен')}</td>
                      <td className="p-4">
                        <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          {translateType(fb.feedbackType)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{fb.message || '-'}</td>
                      <td className="p-4 text-center font-mono text-yellow-500">{fb.rating}/5</td>
                      <td className="p-4 text-xs text-slate-500">{formatDate(fb.createdAt)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openDeleteModal(id)} className="text-slate-500 hover:text-red-500 transition-all">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Mobile View */
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((fb) => {
              const id = fb._id || fb.id;
              return (
                <div key={id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative">
                  <button onClick={() => openDeleteModal(id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500">
                    <FaTrash />
                  </button>
                  <div className="text-[10px] font-black uppercase text-blue-500 mb-1">{translateType(fb.feedbackType)}</div>
                  <div className="font-bold text-white mb-2">{fb.user?.email || t('adminFeedback.anonymous', 'Анонимен')}</div>
                  <div className="text-slate-400 text-sm mb-4">"{fb.message || t('adminFeedback.noMessage', 'Без съобщение')}"</div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-3">
                    <span className="text-yellow-500 font-bold">{t('adminFeedback.table.rating', 'Оценка')}: {fb.rating}/5</span>
                    <span className="text-slate-600">{formatDate(fb.createdAt, true)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showDeleteModal && (
          <ConfirmDeleteModal
            onConfirm={confirmDelete}
            onCancel={closeDeleteModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;