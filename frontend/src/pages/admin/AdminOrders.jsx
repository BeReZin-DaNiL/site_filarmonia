import React, { useState, useEffect, useCallback } from 'react';
import { getAllOrders, updateAdminOrder, bulkUpdateOrders } from '../../services/api';
import { Search, Filter, Calendar, CreditCard, User, Tag, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllOrders(filters);
      setOrders(response.data);
      // Clear selection if filtered out
      if (selectedOrder && !response.data.find(o => o.id === selectedOrder.id)) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setProcessing(true);
    try {
      const response = await updateAdminOrder(selectedOrder.id, { status: newStatus });
      setSelectedOrder(response.data);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? response.data : o));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Вы уверены, что хотите применить действие "${action}" к ${selectedOrderIds.length} заказам?`)) return;

    setProcessing(true);
    try {
      await bulkUpdateOrders({ orderIds: selectedOrderIds, action });
      await fetchOrders();
      setSelectedOrderIds([]);
      setSelectedOrder(null);
      alert('Массовая операция выполнена успешно');
    } catch (error) {
      console.error('Failed to perform bulk action', error);
      alert('Ошибка при выполнении массовой операции');
    } finally {
      setProcessing(false);
    }
  };

  const toggleOrderSelection = (id, e) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'booked': return 'В брони';
      case 'cancelled': return 'Аннулирован';
      case 'returned': return 'Возвращён';
      default: return status;
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar: Order List */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Заказы</h3>
            <span className="text-xs text-gray-500">Всего: {orders.length}</span>
          </div>
          
          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск по №, email, событию..." 
                className="w-full pl-8 p-2 border rounded text-sm"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Все статусы</option>
                <option value="paid">Оплачен</option>
                <option value="booked">В брони</option>
                <option value="cancelled">Аннулирован</option>
                <option value="returned">Возвращён</option>
              </select>
              <input 
                type="date"
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>
          </div>
          
          {/* Bulk Selection Info */}
          {selectedOrderIds.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded flex justify-between items-center">
              <span>Выбрано: {selectedOrderIds.length}</span>
              <button onClick={() => setSelectedOrderIds([])} className="text-blue-900 hover:underline">Сбросить</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map(order => (
                <li 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-red-50 border-l-4 border-red-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => toggleOrderSelection(order.id, e)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">#{order.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 mt-1 line-clamp-1">{order.event.title}</div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        <span>{order.totalPrice} ₽</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{order.user.username}</div>
                    </div>
                  </div>
                </li>
              ))}
              {orders.length === 0 && (
                <li className="p-8 text-center text-gray-400">Заказов не найдено</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Right Area: Detail or Bulk Actions */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
        {selectedOrderIds.length > 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
             <h2 className="text-2xl font-bold mb-6 text-gray-800">Массовые операции</h2>
             <p className="text-gray-500 mb-8">Выбрано заказов: {selectedOrderIds.length}</p>
             
             <div className="grid grid-cols-2 gap-4 w-full max-w-md">
               <button 
                 onClick={() => handleBulkAction('cancel')}
                 className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 flex flex-col items-center gap-2"
               >
                 <XCircle className="text-red-600 h-8 w-8" />
                 <span className="font-medium text-red-900">Аннулировать все</span>
               </button>
               
               <button 
                 onClick={() => handleBulkAction('return')}
                 className="p-4 border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 flex flex-col items-center gap-2"
               >
                 <RefreshCw className="text-gray-600 h-8 w-8" />
                 <span className="font-medium text-gray-900">Оформить возврат</span>
               </button>
             </div>
          </div>
        ) : selectedOrder ? (
          <>
            <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Заказ #{selectedOrder.id}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Создан: {new Date(selectedOrder.orderDate).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                 {selectedOrder.status === 'booked' && (
                   <button 
                     onClick={() => handleStatusChange('cancelled')}
                     className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                   >
                     Аннулировать бронь
                   </button>
                 )}
                 {selectedOrder.status === 'paid' && (
                   <button 
                     onClick={() => handleStatusChange('returned')}
                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                   >
                     Возврат средств
                   </button>
                 )}
                 <button className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">
                   Печать билетов
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Event Info */}
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Мероприятие
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Название</p>
                      <p className="font-medium">{selectedOrder.event.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Дата</p>
                      <p className="font-medium">{new Date(selectedOrder.event.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Зал</p>
                      <p className="font-medium">{selectedOrder.event.venue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Жанр</p>
                      <p className="font-medium">{selectedOrder.event.genre}</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Покупатель
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Логин</p>
                      <p className="font-medium">{selectedOrder.user.username}</p>
                    </div>
                    {/* In a real app we would have more user details here */}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Оплата
                  </h3>
                  <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-gray-500">Сумма</span>
                       <span className="font-bold text-lg">{selectedOrder.totalPrice} ₽</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Способ</span>
                       <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t">
                       <span className="text-gray-500">Статус</span>
                       <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                         {getStatusLabel(selectedOrder.status)}
                       </span>
                     </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="col-span-2">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    Билеты ({selectedOrder.ticketsCount})
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="p-3">Тип</th>
                          <th className="p-3">Место</th>
                          <th className="p-3">Цена</th>
                          <th className="p-3">Код билета</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrder.seats && selectedOrder.seats.length > 0 ? (
                          selectedOrder.seats.map((seat, idx) => (
                            <tr key={idx}>
                              <td className="p-3">{seat.category || 'Стандарт'}</td>
                              <td className="p-3">Ряд {seat.row}, Место {seat.number}</td>
                              <td className="p-3">{seat.price} ₽</td>
                              <td className="p-3 font-mono">{selectedOrder.ticketNumber}-{idx+1}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-500">
                              Билеты без указания мест (входной билет) x {selectedOrder.ticketsCount}
                              <br />
                              Код: {selectedOrder.ticketNumber}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* History/Logs (Mock) */}
                <div className="col-span-2">
                  <h3 className="font-bold text-gray-900 mb-3">История изменений</h3>
                  <div className="bg-gray-50 p-4 rounded text-sm text-gray-500">
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="font-mono text-gray-400">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                        <span>Заказ создан</span>
                      </li>
                      {selectedOrder.status === 'paid' && (
                         <li className="flex gap-2">
                           <span className="font-mono text-gray-400">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                           <span>Оплата прошла успешно</span>
                         </li>
                      )}
                       {selectedOrder.status === 'cancelled' && (
                         <li className="flex gap-2">
                           <span className="font-mono text-gray-400">{new Date().toLocaleDateString()}</span>
                           <span className="text-red-600">Заказ аннулирован администратором</span>
                         </li>
                      )}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">📦</span>
            <p>Выберите заказ для просмотра</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
