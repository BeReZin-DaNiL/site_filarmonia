import React, { useState, useEffect, useCallback } from 'react';
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from '../../services/api';

// Simple debounce implementation to avoid adding lodash dependency
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

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '', genre: '', venue: '' });
  const [loading, setLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminEvents(filters);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounced save
  const debouncedSave = useCallback(
    debounce(async (eventData) => {
      setAutoSaveStatus('saving');
      try {
        await updateEvent(eventData.id, eventData);
        setAutoSaveStatus('saved');
        // Update list locally to reflect changes without full refetch if needed
        setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      } catch (error) {
        console.error('Auto-save failed', error);
        setAutoSaveStatus('error');
      }
    }, 1000),
    []
  );

  const handleFieldChange = (field, value) => {
    if (!selectedEvent) return;
    
    const updatedEvent = { ...selectedEvent, [field]: value };
    setSelectedEvent(updatedEvent);
    debouncedSave(updatedEvent);
  };

  const handleCreateEvent = async () => {
    try {
      const newEvent = {
        title: 'Новое мероприятие',
        genre: 'Классика',
        date: new Date().toISOString(),
        venue: 'Большой зал',
        status: 'draft',
        price: 1000,
        availableTickets: 100,
        description: '',
        performers: '',
        duration: '',
        ageRestriction: '6+'
      };
      const response = await createEvent(newEvent);
      setEvents([response.data, ...events]);
      setSelectedEvent(response.data);
    } catch (error) {
      console.error('Failed to create event', error);
    }
  };

  const handleArchiveEvent = async () => {
    if (!selectedEvent) return;
    handleFieldChange('status', 'archived');
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !window.confirm('Вы уверены, что хотите удалить это мероприятие?')) return;
    try {
      await deleteEvent(selectedEvent.id);
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar: Event List */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Мероприятия</h3>
            <button 
              onClick={handleCreateEvent}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              + Создать
            </button>
          </div>
          
          {/* Filters */}
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Поиск..." 
              className="w-full p-2 border rounded text-sm"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <div className="flex gap-2">
              <select 
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="draft">Черновики</option>
                <option value="archived">Архив</option>
              </select>
              <select 
                className="w-1/2 p-2 border rounded text-sm"
                value={filters.venue}
                onChange={(e) => setFilters({...filters, venue: e.target.value})}
              >
                <option value="">Все залы</option>
                <option value="Большой зал">Большой зал</option>
                <option value="Малый зал">Малый зал</option>
                <option value="Камерный зал">Камерный зал</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {events.map(event => (
                <li 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEvent?.id === event.id ? 'bg-red-50 border-l-4 border-red-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{event.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status === 'active' ? 'Активен' : event.status === 'draft' ? 'Черновик' : 'Архив'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 flex justify-between">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.venue}</span>
                  </div>
                </li>
              ))}
              {events.length === 0 && (
                <li className="p-8 text-center text-gray-400">Мероприятий не найдено</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Right Area: Editor */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
        {selectedEvent ? (
          <>
            {/* Editor Toolbar */}
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
              <div className="flex gap-2">
                <button 
                  onClick={handleArchiveEvent}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  Архивировать
                </button>
                <button 
                  onClick={handleDeleteEvent}
                  className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                >
                  Удалить
                </button>
              </div>
            </div>

            {/* Editor Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название мероприятия</label>
                  <input 
                    type="text" 
                    value={selectedEvent.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата и время</label>
                  <input 
                    type="datetime-local" 
                    value={selectedEvent.date ? selectedEvent.date.slice(0, 16) : ''}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select 
                    value={selectedEvent.status || 'draft'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="draft">Черновик</option>
                    <option value="active">Активен (Опубликован)</option>
                    <option value="archived">В архиве</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Жанр</label>
                  <select 
                    value={selectedEvent.genre}
                    onChange={(e) => handleFieldChange('genre', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Классика">Классика</option>
                    <option value="Джаз">Джаз</option>
                    <option value="Рок">Рок</option>
                    <option value="Фолк">Фолк</option>
                    <option value="Опера">Опера</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Место проведения</label>
                  <select 
                    value={selectedEvent.venue}
                    onChange={(e) => handleFieldChange('venue', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Большой зал">Большой зал</option>
                    <option value="Малый зал">Малый зал</option>
                    <option value="Камерный зал">Камерный зал</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Исполнители</label>
                  <input 
                    type="text" 
                    value={selectedEvent.performers}
                    onChange={(e) => handleFieldChange('performers', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea 
                    rows={4}
                    value={selectedEvent.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (от)</label>
                  <input 
                    type="number" 
                    value={selectedEvent.price}
                    onChange={(e) => handleFieldChange('price', parseInt(e.target.value))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Доступно билетов</label>
                  <input 
                    type="number" 
                    value={selectedEvent.availableTickets}
                    onChange={(e) => handleFieldChange('availableTickets', parseInt(e.target.value))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Возрастное ограничение</label>
                  <select 
                    value={selectedEvent.ageRestriction}
                    onChange={(e) => handleFieldChange('ageRestriction', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="0+">0+</option>
                    <option value="6+">6+</option>
                    <option value="12+">12+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Изображение (URL)</label>
                  <input 
                    type="text" 
                    value={selectedEvent.imageUrl || ''}
                    onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Управление билетами и схемой зала</h4>
                <div className="bg-gray-50 p-4 rounded border text-center">
                  <p className="text-gray-500 mb-2">Здесь будет интерактивный редактор схемы зала</p>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Загрузить схему зала
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">🎭</span>
            <p>Выберите мероприятие для редактирования</p>
            <p className="text-sm">или создайте новое</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
