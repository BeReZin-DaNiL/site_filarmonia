import { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;
  
  // Filters
  const [filters, setFilters] = useState({
    genre: '',
    venue: '',
    minPrice: '',
    maxPrice: '',
    sort: 'date_asc'
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [page, filters]); // Reload when page or filters change

  const loadEvents = async () => {
    try {
      const params = {
        search,
        page,
        size: pageSize,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => params[key] === '' && delete params[key]);
      
      const response = await getEvents(params);
      
      if (response.data.content) {
          setEvents(response.data.content);
          setTotalPages(response.data.totalPages);
      } else if (Array.isArray(response.data)) {
          setEvents(response.data);
          setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadEvents();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">Афиша филармонии</h1>
        <p className="text-gray-600 mb-8">Лучшие классические концерты и мероприятия города</p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Поиск мероприятий..."
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-accent focus:border-transparent outline-none pl-12 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 text-gray-400" size={20} />
            <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
                Фильтры
            </button>
          </div>
        </form>

        {showFilters && (
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Жанр</label>
                    <select name="genre" value={filters.genre} onChange={handleFilterChange} className="w-full border rounded-md p-2">
                        <option value="">Все жанры</option>
                        <option value="Классика">Классика</option>
                        <option value="Джаз">Джаз</option>
                        <option value="Рок">Рок</option>
                        <option value="Фолк">Фолк</option>
                        <option value="Опера">Опера</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Площадка</label>
                    <select name="venue" value={filters.venue} onChange={handleFilterChange} className="w-full border rounded-md p-2">
                        <option value="">Все площадки</option>
                        <option value="Большой зал">Большой зал</option>
                        <option value="Малый зал">Малый зал</option>
                        <option value="Камерный зал">Камерный зал</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Сортировка</label>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange} className="w-full border rounded-md p-2">
                        <option value="date_asc">Сначала ближайшие</option>
                        <option value="date_desc">Сначала дальние</option>
                        <option value="price_asc">Сначала дешевые</option>
                        <option value="price_desc">Сначала дорогие</option>
                        <option value="alpha_asc">По алфавиту (А-Я)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена от</label>
                    <input 
                        type="number" 
                        name="minPrice" 
                        value={filters.minPrice} 
                        onChange={handleFilterChange} 
                        placeholder="0"
                        className="w-full border rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена до</label>
                    <input 
                        type="number" 
                        name="maxPrice" 
                        value={filters.maxPrice} 
                        onChange={handleFilterChange} 
                        placeholder="10000"
                        className="w-full border rounded-md p-2"
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => setFilters({ genre: '', venue: '', minPrice: '', maxPrice: '', sort: 'date_asc' })}
                        className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                        Сбросить
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gray-200 relative">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-gray-500">
                        No Image
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow">
                    {event.price} ₽
                </div>
                {event.genre && (
                  <div className="absolute bottom-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow uppercase tracking-wider">
                    {event.genre}
                  </div>
                )}
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar size={16} className="mr-2" />
                {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">{event.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Доступно: {event.availableTickets} мест</span>
                <Link 
                  to={`/event/${event.id}`}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`p-2 rounded-lg border ${page === 0 ? 'text-gray-300 border-gray-200' : 'text-primary border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronLeft size={20} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg border font-medium ${
                page === i 
                  ? 'bg-primary text-white border-primary' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className={`p-2 rounded-lg border ${page === totalPages - 1 ? 'text-gray-300 border-gray-200' : 'text-primary border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;