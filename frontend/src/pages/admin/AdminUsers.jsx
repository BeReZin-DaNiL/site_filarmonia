import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, updateAdminUser, bulkUpdateUsers } from '../../services/api';
import { Search, Filter, User, Mail, Phone, Shield, Lock, Unlock, Users, MoreHorizontal } from 'lucide-react';

// Simple debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers(filters);
      setUsers(response.data);
      if (selectedUser && !response.data.find(u => u.id === selectedUser.id)) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const debouncedSave = useCallback(
    debounce(async (userData) => {
      setAutoSaveStatus('saving');
      try {
        await updateAdminUser(userData.id, userData);
        setAutoSaveStatus('saved');
        setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
      } catch (error) {
        console.error('Auto-save failed', error);
        setAutoSaveStatus('error');
      }
    }, 1000),
    []
  );

  const handleFieldChange = (field, value) => {
    if (!selectedUser) return;
    const updatedUser = { ...selectedUser, [field]: value };
    setSelectedUser(updatedUser);
    debouncedSave(updatedUser);
  };

  const handleBlockToggle = async () => {
    if (!selectedUser) return;
    const isBlocked = selectedUser.securitySettings?.isBlocked;
    const action = isBlocked ? 'Unblock' : 'Block';
    
    if (!window.confirm(`Вы уверены, что хотите ${action === 'Block' ? 'заблокировать' : 'разблокировать'} этого пользователя?`)) return;

    const updatedUser = { 
        ...selectedUser, 
        securitySettings: { 
            ...selectedUser.securitySettings, 
            isBlocked: !isBlocked,
            blockReason: !isBlocked ? 'Blocked by admin' : '' 
        } 
    };
    
    // Immediate update for critical actions
    try {
        await updateAdminUser(selectedUser.id, { 
            isBlocked: !isBlocked, 
            blockReason: !isBlocked ? 'Blocked by admin' : '' 
        });
        setSelectedUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
    } catch (error) {
        console.error('Failed to update block status', error);
        alert('Ошибка при обновлении статуса блокировки');
    }
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Применить действие к ${selectedUserIds.length} пользователям?`)) return;

    setProcessing(true);
    try {
      await bulkUpdateUsers({ userIds: selectedUserIds, action, value });
      await fetchUsers();
      setSelectedUserIds([]);
      setSelectedUser(null);
      alert('Массовая операция выполнена успешно');
    } catch (error) {
      console.error('Failed to perform bulk action', error);
      alert('Ошибка при выполнении массовой операции');
    } finally {
      setProcessing(false);
    }
  };

  const toggleUserSelection = (id, e) => {
    e.stopPropagation();
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar: User List */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Пользователи</h3>
            <span className="text-xs text-gray-500">Всего: {users.length}</span>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск по имени, email..." 
                className="w-full pl-8 p-2 border rounded text-sm"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">Все роли</option>
                <option value="USER">Пользователь</option>
                <option value="ADMIN">Администратор</option>
                <option value="MODERATOR">Модератор</option>
              </select>
              <select 
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
              </select>
            </div>
          </div>

          {selectedUserIds.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded flex justify-between items-center">
              <span>Выбрано: {selectedUserIds.length}</span>
              <button onClick={() => setSelectedUserIds([])} className="text-blue-900 hover:underline">Сбросить</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map(user => (
                <li 
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-red-50 border-l-4 border-red-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => toggleUserSelection(user.id, e)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">{user.username}</span>
                        <div className="flex gap-1">
                            {user.role === 'ADMIN' && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Admin</span>}
                            {user.securitySettings?.isBlocked && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Blocked</span>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{user.fullName || 'Без имени'}</div>
                      <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                    </div>
                  </div>
                </li>
              ))}
              {users.length === 0 && (
                <li className="p-8 text-center text-gray-400">Пользователей не найдено</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Right Area: Profile Editor or Bulk Actions */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
        {selectedUserIds.length > 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
             <h2 className="text-2xl font-bold mb-6 text-gray-800">Массовые операции</h2>
             <p className="text-gray-500 mb-8">Выбрано пользователей: {selectedUserIds.length}</p>
             
             <div className="grid grid-cols-2 gap-4 w-full max-w-md">
               <button 
                 onClick={() => handleBulkAction('block')}
                 className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 flex flex-col items-center gap-2"
               >
                 <Lock className="text-red-600 h-8 w-8" />
                 <span className="font-medium text-red-900">Заблокировать всех</span>
               </button>
               
               <button 
                 onClick={() => handleBulkAction('unblock')}
                 className="p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 flex flex-col items-center gap-2"
               >
                 <Unlock className="text-green-600 h-8 w-8" />
                 <span className="font-medium text-green-900">Разблокировать всех</span>
               </button>

               <div className="col-span-2 p-4 border border-gray-200 bg-gray-50 rounded-lg flex flex-col gap-2">
                 <label className="text-sm font-medium text-gray-700">Назначить роль</label>
                 <div className="flex gap-2">
                     <select id="bulkRoleSelect" className="flex-1 p-2 border rounded">
                         <option value="USER">Пользователь</option>
                         <option value="MODERATOR">Модератор</option>
                         <option value="ADMIN">Администратор</option>
                     </select>
                     <button 
                        onClick={() => handleBulkAction('set_role', document.getElementById('bulkRoleSelect').value)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                     >
                        Применить
                     </button>
                 </div>
               </div>
             </div>
          </div>
        ) : selectedUser ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                <span className={`text-sm flex items-center gap-2 ${
                  autoSaveStatus === 'saved' ? 'text-green-600' : 
                  autoSaveStatus === 'saving' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {autoSaveStatus === 'saved' && '✓ Сохранено'}
                  {autoSaveStatus === 'saving' && '💾 Сохранение...'}
                  {autoSaveStatus === 'error' && '⚠️ Ошибка сохранения'}
                </span>
              </div>
              <button 
                  onClick={handleBlockToggle}
                  className={`px-3 py-1 text-sm border rounded flex items-center gap-2 ${
                      selectedUser.securitySettings?.isBlocked 
                      ? 'border-green-200 text-green-600 hover:bg-green-50' 
                      : 'border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {selectedUser.securitySettings?.isBlocked ? <Unlock className="h-4 w-4"/> : <Lock className="h-4 w-4"/>}
                  {selectedUser.securitySettings?.isBlocked ? 'Разблокировать' : 'Заблокировать'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl font-bold">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.username}</h2>
                  <p className="text-gray-500">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Личные данные</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={selectedUser.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={selectedUser.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={selectedUser.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль в системе</label>
                  <div className="relative">
                    <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <select 
                      value={selectedUser.role}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="USER">Пользователь</option>
                      <option value="MODERATOR">Модератор</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Статус и Безопасность</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Статус аккаунта</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        selectedUser.securitySettings?.isBlocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.securitySettings?.isBlocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </div>
                    {selectedUser.securitySettings?.isBlocked && (
                      <div className="text-sm text-red-600 mt-2">
                        Причина: {selectedUser.securitySettings?.blockReason || 'Не указана'}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">👤</span>
            <p>Выберите пользователя для редактирования</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
