import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaTerminal, FaHistory, FaTrashAlt, FaExclamationCircle } from 'react-icons/fa';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useTranslation } from 'react-i18next'; // <-- ИМПОРТ ЗА ПРЕВОДИТЕ

const AdminLogs = () => {
  const { t, i18n } = useTranslation(); // <-- ИНИЦИАЛИЗАЦИЯ НА ПРЕВОДАЧА

  const [logs, setLogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // КОРЕКЦИЯ ЗА VITE
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${backendUrl}/logs/getAllLogs`);
      setLogs(res.data.logs || res.data);
    } catch (err) {
      // ТУК Е ПРОМЯНАТА
      const backendError = err.response?.data?.error;
      if (backendError === 'ERROR_FETCHING_LOGS') {
         console.error(t('adminLogs.errors.fetchFailed', 'Грешка при зареждането на логовете'));
      } else {
         console.error('Error fetching logs:', err);
      }
    }
  };

  useEffect(() => {
    fetchLogs();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // ДОБАВЕН ПРАЗЕН МАСИВ []

  const confirmDelete = async () => {
    try {
      if (Array.isArray(deleteTargetId)) {
        await axios.post(`${backendUrl}/logs/deleteMultipleLogs`, {
          ids: deleteTargetId,
        });
        setSelectedIds([]);
        setSelectAll(false);
      } else {
        await axios.delete(`${backendUrl}/logs/deleteLogById/${deleteTargetId}`);
      }
      fetchLogs();
    } catch (err) {
      // ТУК Е ПРОМЯНАТА
      console.error('Error deleting logs:', err);
      const backendError = err.response?.data?.error;
      
      if (backendError === 'ERROR_DELETING_MULTIPLE_LOGS') {
          alert(t('adminLogs.errors.deleteMultipleFailed', 'Грешка при групово изтриване на логовете.'));
      } else if (backendError === 'ERROR_DELETING_LOG') {
          alert(t('adminLogs.errors.deleteFailed', 'Грешка при изтриване на лог.'));
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
      setSelectedIds(logs.map(log => log._id || log.id)); 
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

  const sortedLogs = [...logs].sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1;
    return factor * (new Date(a.createdAt) - new Date(b.createdAt));
  });

  // Помощна функция за локализиране на датата
  const formatDate = (dateString, isMobileView = false) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 'en-US';
    return isMobileView ? date.toLocaleDateString(locale) : date.toLocaleString(locale);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-4 md:p-8 pt-24 font-mono">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-3 text-white">
            <FaTerminal className="text-green-500" /> {t('adminLogs.title', 'System_Logs.txt')}
          </h1>
          
          <div className="flex items-center gap-3">
            <select 
              className="bg-slate-800 border border-slate-700 rounded p-2 text-xs outline-none focus:border-green-500 transition-all"
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">{t('adminLogs.newestFirst', 'Най-нови отгоре')}</option>
              <option value="asc">{t('adminLogs.oldestFirst', 'Най-стари отгоре')}</option>
            </select>

            {selectedIds.length > 0 && (
              <button 
                className="bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-2 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                onClick={() => openDeleteModal(selectedIds)}
              >
                <FaTrashAlt /> {t('adminLogs.wipeSelected', 'Изтрий избраните')} ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {!isMobile ? (
          /* Desktop Table View */
          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-500 uppercase tracking-tighter">
                <tr>
                  <th className="p-4 w-10">
                    <input type="checkbox" className="accent-green-500" checked={selectAll} onChange={toggleSelectAll} />
                  </th>
                  <th className="p-4">{t('adminLogs.table.userId', 'User_ID')}</th>
                  <th className="p-4 text-center">{t('adminLogs.table.status', 'Status')}</th>
                  <th className="p-4">{t('adminLogs.table.eventMessage', 'Event_Message')}</th>
                  <th className="p-4">{t('adminLogs.table.origin', 'Origin')}</th>
                  <th className="p-4">{t('adminLogs.table.timestamp', 'Timestamp')}</th>
                  <th className="p-4 text-right">{t('adminLogs.table.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {sortedLogs.map((log) => {
                  const id = log._id || log.id;
                  const isError = log.errorStatus >= 400;
                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <input type="checkbox" className="accent-green-500" checked={selectedIds.includes(id)} onChange={() => toggleSelect(id)} />
                      </td>
                      <td className="p-4 text-blue-400 font-bold truncate max-w-[150px]">{log.user?.email || 'SYSTEM'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isError ? 'bg-red-900/30 text-red-500 border border-red-900' : 'bg-green-900/30 text-green-500 border border-green-900'}`}>
                          {log.errorStatus}
                        </span>
                      </td>
                      <td className={`p-4 ${isError ? 'text-red-400' : 'text-slate-400'} italic`}>
                        {log.errorMessage}
                      </td>
                      <td className="p-4 text-slate-500">
                        <span className="text-slate-200">{log.className}</span>::{log.functionName}
                      </td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openDeleteModal(id)} className="text-slate-700 hover:text-red-500 transition-all">
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
          /* Mobile Card View */
          <div className="space-y-4">
            {sortedLogs.map((log) => (
              <div key={log._id || log.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${log.errorStatus >= 400 ? 'bg-red-600' : 'bg-green-600'}`} />
                <button 
                  onClick={() => openDeleteModal(log._id || log.id)} 
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-500"
                >
                  <FaTrash size={14} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-slate-400">{log.errorStatus}</span>
                  <span className="text-xs text-blue-400 font-bold truncate">{log.user?.email || 'SYSTEM'}</span>
                </div>
                <div className="text-sm text-slate-300 mb-2 leading-relaxed">"{log.errorMessage}"</div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{log.className}::{log.functionName}</span>
                  <span>{formatDate(log.createdAt, true)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedLogs.length === 0 && (
          <div className="text-center py-20 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
             <FaHistory className="mx-auto text-4xl text-slate-700 mb-4" />
             <p className="text-slate-500 uppercase tracking-widest text-sm">{t('adminLogs.noLogs', 'No activity logs found in database')}</p>
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

export default AdminLogs;