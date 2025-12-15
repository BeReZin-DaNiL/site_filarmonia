import { useState, useEffect } from 'react';
import { createEvent, updateEvent, deleteEvent, getEvents, getAllOrders } from '../services/api';
import { Trash2, Edit, Plus } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    price: '',
    availableTickets: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (activeTab === 'events') loadEvents();
    else loadOrders();
  }, [activeTab]);

  const loadEvents = async () => {
    const response = await getEvents();
    setEvents(response.data);
  };

  const loadOrders = async () => {
    const response = await getAllOrders();
    setOrders(response.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      await deleteEvent(id);
      loadEvents();
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      price: event.price,
      availableTickets: event.availableTickets,
      imageUrl: event.imageUrl
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        await updateEvent(currentEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      setIsModalOpen(false);
      setCurrentEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        price: '',
        availableTickets: '',
        imageUrl: ''
      });
      loadEvents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Панель администратора</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'events' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setActiveTab('events')}
        >
          Мероприятия
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'orders' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
      </div>

      {activeTab === 'events' && (
        <div>
          <button
            onClick={() => {
              setCurrentEvent(null);
              setFormData({
                title: '',
                description: '',
                date: '',
                price: '',
                availableTickets: '',
                imageUrl: ''
              });
              setIsModalOpen(true);
            }}
            className="mb-6 bg-accent text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 transition"
          >
            <Plus className="mr-2" size={20} />
            Добавить мероприятие
          </button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Название</th>
                  <th className="p-4 font-semibold text-gray-600">Дата</th>
                  <th className="p-4 font-semibold text-gray-600">Цена</th>
                  <th className="p-4 font-semibold text-gray-600">Билеты</th>
                  <th className="p-4 font-semibold text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{event.title}</td>
                    <td className="p-4">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-4">{event.price} ₽</td>
                    <td className="p-4">{event.availableTickets}</td>
                    <td className="p-4 flex space-x-2">
                      <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Заказа</th>
                <th className="p-4 font-semibold text-gray-600">Пользователь</th>
                <th className="p-4 font-semibold text-gray-600">Мероприятие</th>
                <th className="p-4 font-semibold text-gray-600">Билеты</th>
                <th className="p-4 font-semibold text-gray-600">Сумма</th>
                <th className="p-4 font-semibold text-gray-600">Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">#{order.id}</td>
                  <td className="p-4">{order.user.username}</td>
                  <td className="p-4">{order.event.title}</td>
                  <td className="p-4">{order.ticketsCount}</td>
                  <td className="p-4">{order.totalPrice} ₽</td>
                  <td className="p-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-primary">
              {currentEvent ? 'Редактировать мероприятие' : 'Новое мероприятие'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Название"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Описание"
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="Цена"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Кол-во билетов"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.availableTickets}
                  onChange={(e) => setFormData({...formData, availableTickets: e.target.value})}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="URL изображения"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-1/2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;