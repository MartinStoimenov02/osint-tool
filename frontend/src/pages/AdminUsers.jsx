import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaEnvelope, FaUserShield } from 'react-icons/fa';
import DeleteAccountModal from "../components/DeleteAccountModal";
import SendMessageModal from '../components/SendMessageModal';
// Вмъкваме новия модал
import ConfirmActionModal from "../components/ConfirmActionModal";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('name');
  const [isMessageMode, setIsMessageMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Стейт за новия модал
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', userId: null });

  // Корекция за Vite
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const currentUser = useSelector((state) => state.user.user); 

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/users/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || res.data);
    } catch (err) {
      // НОВО: Проверка за системен код при зареждане
      const backendError = err.response?.data?.error;
      if (backendError === 'ERROR_FETCHING_USERS') {
          console.error(t('adminUsers.errors.fetchFailed', 'Грешка при зареждане на списъка.'));
      } else {
          console.error('Error fetching users:', err);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditUserId(user._id || user.id);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditedUser({});
  };

  const handleSaveEdit = async () => {
    try {
      const id = editUserId;
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/users/updateUser/${id}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditUserId(null);
      fetchUsers();
      // Опционално добавяме съобщение за успех
      setMessage(t('adminUsers.userUpdated', 'Потребителят е обновен успешно!'));
      setSuccess(true);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      const backendError = err.response?.data?.error;
      setSuccess(false);
      if (backendError === 'ERROR_UPDATING_USER') {
          setMessage(t('adminUsers.errors.updateFailed', 'Грешка при обновяване.'));
      } else {
          setMessage(t('common.error', 'Възникна грешка!'));
      }
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteClick = (user) => {
    // Подготовка на обекта за DeleteAccountModal
    const preparedUser = { ...user, id: user._id || user.id };
    preparedUser.hasPassword = user.password !== undefined;
    setSelectedUser(preparedUser);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteSuccess = () => {
    fetchUsers();
    setIsDeleteModalOpen(false);
  };

  const handleChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const toggleUserSelection = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleOpenMessageMode = () => {
    setIsMessageMode(true);
    setSelectedUserIds([]);
  };

  const handleCancelMessageMode = () => {
    setIsMessageMode(false);
    setSelectedUserIds([]);
  };

  const handleConfirmSendMessage = () => {
    if (selectedUserIds.length === 0) {
      setMessage(t('adminUsers.selectAtLeastOne', 'Моля, изберете поне един потребител!'));
      setSuccess(false); 
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setIsSendModalOpen(true);
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
  };

  const handleSendMessageSuccess = () => {
    setMessage(t('adminUsers.messageSent', 'Съобщението е изпратено успешно!'));
    setSuccess(true);
    setIsMessageMode(false);
    setSelectedUserIds([]);
    setTimeout(() => setMessage(""), 3000);
  };  

  const toggleSelectAll = () => {
    const filteredIds = filteredAndSortedUsers.map((u) => u._id || u.id);
    if (selectedUserIds.length === filteredIds.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredIds);
    }
  };  

  // --- ЛОГИКА ЗА НОВИЯ МОДАЛ ---
  const triggerApprove = (id) => {
    setActionModal({ isOpen: true, type: 'approve', userId: id });
  };

  const triggerReject = (id) => {
    setActionModal({ isOpen: true, type: 'reject', userId: id });
  };

  const executeAction = async () => {
    const { type, userId } = actionModal;
    const token = localStorage.getItem("token");

    try {
        if (type === 'approve') {
            await axios.put(`${backendUrl}/users/approveUser/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(t('adminUsers.userApproved', 'Потребителят е одобрен успешно!'));
        } else if (type === 'reject') {
            await axios.delete(`${backendUrl}/users/rejectUser/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(t('adminUsers.userRejected', 'Потребителят е отхвърлен и изтрит!'));
        }
        fetchUsers();
        setSuccess(true);
        setTimeout(() => setMessage(""), 3000);
    } catch (err) { 
        console.error(err);
        const backendError = err.response?.data?.error;
        setSuccess(false);
        
        if (backendError === 'USER_NOT_FOUND') {
            setMessage(t('auth.errors.userNotFound', 'Потребителят не е намерен.'));
        } else if (backendError === 'ERROR_APPROVING_USER' || backendError === 'ERROR_REJECTING_USER') {
            setMessage(t('adminUsers.errors.actionFailed', 'Грешка при изпълнение на действието.'));
        } else {
            setMessage(t('common.error', 'Възникна неочаквана грешка!'));
        }
        setTimeout(() => setMessage(""), 3000);
    } finally {
        setActionModal({ isOpen: false, type: '', userId: null });
    }
  };

  // Функциите handleApprove и handleReject са премахнати, защото вече ползваме executeAction

  const filteredAndSortedUsers = users
  .filter(user => {
    if (filterOption === 'admins' && !user.isAdmin) return false;
    if (filterOption === 'regular' && user.isAdmin) return false;
    if (filterOption === 'google' && !user.isGoogleAuth) return false;
    if (filterOption === 'nogoogle' && user.isGoogleAuth) return false;
    return true;
  })
  .filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phoneNumber?.toLowerCase().includes(query)
    );
  })
  .sort((a, b) => {
    // 1. Неодобрените винаги най-отгоре
    const aPending = !a.isAccepted && !a.isAdmin;
    const bPending = !b.isAccepted && !b.isAdmin;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;

    // 2. След това сортиране по избор
    const aValue = a[sortOption];
    const bValue = b[sortOption];
    if (typeof aValue === 'string') return aValue.localeCompare(bValue);
    return (bValue || 0) - (aValue || 0); 
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Контролен панел */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-black uppercase flex items-center gap-2 text-white">
               <FaUserShield className="text-blue-500" /> {t('adminUsers.title', 'Потребители')}
            </h1>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <input
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 flex-grow"
                type="text"
                placeholder={t('adminUsers.searchPlaceholder', 'Търсене...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
                <option value="all">{t('adminUsers.filters.all', 'Всички')}</option>
                <option value="admins">{t('adminUsers.filters.admins', 'Админи')}</option>
                <option value="regular">{t('adminUsers.filters.regular', 'Обикновени')}</option>
                <option value="google">{t('adminUsers.filters.google', 'С Google')}</option>
                <option value="nogoogle">{t('adminUsers.filters.noGoogle', 'Без Google')}</option>
              </select>

              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="name">{t('adminUsers.sort.name', 'Име')}</option>
                <option value="email">{t('adminUsers.sort.email', 'Имейл')}</option>
              </select>

              <div className="flex gap-2">
                {!isMessageMode ? (
                  <button className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg transition-all" title={t('adminUsers.sendMessage', 'Изпрати съобщение')} onClick={handleOpenMessageMode}>
                    <FaEnvelope />
                  </button>
                ) : (
                  <>
                    <button className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg font-bold" onClick={handleConfirmSendMessage}><FaCheck /></button>
                    <button className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg font-bold" onClick={handleCancelMessageMode}><FaTimes /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Таблица - Desktop View */}
        <div className="hidden md:block bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-700/50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                {isMessageMode && (
                  <th className="p-4 border-b border-slate-700">
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={filteredAndSortedUsers.length > 0 && filteredAndSortedUsers.every((u) => selectedUserIds.includes(u._id || u.id))}                      
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="p-4 border-b border-slate-700">{t('adminUsers.table.name', 'Име')}</th>
                <th className="p-4 border-b border-slate-700">{t('adminUsers.table.phone', 'Телефон')}</th>
                <th className="p-4 border-b border-slate-700">{t('adminUsers.table.email', 'Email')}</th>
                <th className="p-4 border-b border-slate-700 text-center">{t('adminUsers.table.google', 'Google')}</th>
                <th className="p-4 border-b border-slate-700 text-center">{t('adminUsers.table.admin', 'Админ')}</th>
                <th className="p-4 border-b border-slate-700 text-right">{t('adminUsers.table.options', 'Опции')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredAndSortedUsers.map((user) => {
                const userId = user._id || user.id;
                const isEditing = editUserId === userId;
                return (
                  <tr key={userId} className={`hover:bg-slate-700/20 transition-colors ${isEditing ? 'bg-blue-900/10' : ''}`}>
                    {isMessageMode && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="accent-blue-500"
                          checked={selectedUserIds.includes(userId)}
                          onChange={() => toggleUserSelection(userId)}
                        />
                      </td>
                    )}
                    <td className="p-4 font-medium flex items-center">
                      {isEditing ? <input className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-full" value={editedUser.name} onChange={(e) => handleChange('name', e.target.value)} /> : user.name}
                      {!user.isAccepted && !user.isAdmin && <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold">{t('adminUsers.pendingApproval', 'Чака одобрение')}</span>}
                    </td>
                    <td className="p-4 text-slate-400">
                      {isEditing ? <input className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-full" value={editedUser.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} /> : (user.phoneNumber || '-')}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {isEditing ? <input className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-full" value={editedUser.email} onChange={(e) => handleChange('email', e.target.value)} /> : user.email}
                    </td>
                    <td className="p-4 text-center">
                      <input type="checkbox" className="accent-blue-500" checked={isEditing ? editedUser.isGoogleAuth : user.isGoogleAuth} disabled={!isEditing} onChange={(e) => handleChange('isGoogleAuth', e.target.checked)} />
                    </td>
                    <td className="p-4 text-center">
                      <input type="checkbox" className="accent-blue-500" checked={isEditing ? editedUser.isAdmin : user.isAdmin} disabled={!isEditing} onChange={(e) => handleChange('isAdmin', e.target.checked)} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        {!user.isAccepted && !user.isAdmin ? (
                            <>
                                <button onClick={() => triggerApprove(userId)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm" title={t('adminUsers.approve', 'Одобри')}>
                                    <FaCheck />
                                </button>
                                <button onClick={() => triggerReject(userId)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm" title={t('adminUsers.reject', 'Отхвърли')}>
                                    <FaTimes />
                                </button>
                            </>
                        ) : (
                            isEditing ? (
                              <>
                                <FaCheck className="text-green-500 cursor-pointer hover:scale-110 transition-transform" onClick={handleSaveEdit} title={t('common.save', 'Запази')} />
                                <FaTimes className="text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={handleCancelEdit} title={t('common.cancel', 'Отказ')} />
                              </>
                            ) : (
                              <>
                                <FaEdit className="text-slate-500 hover:text-blue-400 cursor-pointer transition-all" onClick={() => handleEditClick(user)} title={t('common.edit', 'Редактирай')} />
                                <FaTrash className="text-slate-500 hover:text-red-500 cursor-pointer transition-all" onClick={() => handleDeleteClick(user)} title={t('common.delete', 'Изтрий')} />
                              </>
                            )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Карти */}
        <div className="md:hidden space-y-4">
          {filteredAndSortedUsers.map(user => {
            const userId = user._id || user.id;
            const isEditing = editUserId === userId;
            const isPending = !user.isAccepted && !user.isAdmin;
            
            return (
              <div className={`bg-slate-800 p-4 rounded-xl border ${isPending ? 'border-yellow-500/50' : 'border-slate-700'}`} key={userId}>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <span className="text-slate-500 uppercase text-[10px] font-bold">{t('adminUsers.table.name', 'Име')}:</span>
                   <div className="text-white">
                     {isEditing ? <input className="bg-slate-900 w-full" value={editedUser.name} onChange={(e) => handleChange('name', e.target.value)} /> : user.name}
                     {isPending && <div className="text-[10px] text-yellow-500 mt-1 font-bold">{t('adminUsers.pendingApproval', 'Чака одобрение')}</div>}
                   </div>
                   <span className="text-slate-500 uppercase text-[10px] font-bold">{t('adminUsers.table.email', 'Email')}:</span>
                   <div className="truncate text-blue-400">{isEditing ? <input className="bg-slate-900 w-full" value={editedUser.email} onChange={(e) => handleChange('email', e.target.value)} /> : user.email}</div>
                </div>
                <div className="mt-4 flex justify-end gap-4 border-t border-slate-700 pt-3">
                    {isPending ? (
                        <>
                            <button onClick={() => triggerApprove(userId)} className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all text-xs font-bold border border-green-500/30">
                                {t('adminUsers.approve', 'Одобри')}
                            </button>
                            <button onClick={() => triggerReject(userId)} className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold border border-red-500/30">
                                {t('adminUsers.reject', 'Отхвърли')}
                            </button>
                        </>
                    ) : (
                        isEditing ? (
                          <><FaCheck className="text-green-500" onClick={handleSaveEdit} /><FaTimes className="text-red-500" onClick={handleCancelEdit} /></>
                        ) : (
                          <><FaEdit className="text-slate-400" onClick={() => handleEditClick(user)} /><FaTrash className="text-red-400" onClick={() => handleDeleteClick(user)} /></>
                        )
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модали и съобщения */}
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onSuccess={handleDeleteSuccess} user={selectedUser} />
      {isSendModalOpen && <SendMessageModal selectedUserIds={selectedUserIds} onClose={handleCloseSendModal} onSuccess={handleSendMessageSuccess} currentUser={currentUser} />}
      
      {/* РЕНДИРАНЕ НА НОВИЯ МОДАЛ */}
      <ConfirmActionModal 
        isOpen={actionModal.isOpen} 
        actionType={actionModal.type}
        onClose={() => setActionModal({ isOpen: false, type: '', userId: null })} 
        onConfirm={executeAction} 
      />

      {message && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl font-bold shadow-2xl z-50 ${success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;