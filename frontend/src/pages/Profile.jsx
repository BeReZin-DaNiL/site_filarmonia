import { useState, useEffect } from 'react';
import { 
    getProfile, updateProfile, getFavorites, 
    getUserOrders, getPolls, votePoll, 
    getChatHistory, sendChatMessage, getEvents,
    cancelOrder, payOrder, deleteOrder
} from '../services/api';
import { jsPDF } from "jspdf";
import { Link } from 'react-router-dom';
import { 
    LayoutDashboard, Settings, MessageSquare, 
    Ticket, Music, BarChart2, Calendar, User, Send,
    CreditCard, MapPin, Phone, Bell, Shield, LogOut, CheckCircle, AlertTriangle, XCircle, Printer,
    Share2, Clock, Smartphone, Monitor, Lock, Loader2, Info, Trash2
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [polls, setPolls] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('basic'); // basic, contact, notifications, security
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    phone: '',
    address: { city: '', street: '', house: '', apartment: '' },
    birthDate: '',
    language: 'ru',
    notificationSettings: {
        emailAfisha: true,
        emailOffers: false,
        emailReminders: true,
        push: true,
        sms: false
    },
    securitySettings: {
        twoFactorEnabled: false
    },
    preferences: { genres: [] }
  });

  // Field status management for auto-save
  const [fieldStatus, setFieldStatus] = useState({}); // { [key]: 'idle' | 'saving' | 'success' | 'error' }
  const [fieldErrors, setFieldErrors] = useState({});

  // Mock Active Sessions
  const [activeSessions, setActiveSessions] = useState([
      { id: 1, device: 'Chrome / Windows', ip: '192.168.1.1', lastActive: 'Сейчас', icon: Monitor },
      { id: 2, device: 'Safari / iPhone', ip: '10.0.0.5', lastActive: '2 часа назад', icon: Smartphone }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user && user.preferences?.genres?.length > 0) {
        loadRecommendations(user.preferences.genres);
    }
  }, [user]);

  // Prevent closing window if saving
  useEffect(() => {
      const handleBeforeUnload = (e) => {
          if (Object.values(fieldStatus).some(status => status === 'saving')) {
              e.preventDefault();
              e.returnValue = '';
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [fieldStatus]);

  const loadData = async () => {
    try {
      const [userRes, favRes, ordersRes, pollsRes, chatRes] = await Promise.all([
          getProfile(),
          getFavorites(),
          getUserOrders(),
          getPolls(),
          getChatHistory()
      ]);

      setUser(userRes.data);
      setFavorites(favRes.data);
      setOrders(ordersRes.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      setPolls(pollsRes.data);
      setChatMessages(chatRes.data);
      
      setFormData({
        ...formData,
        fullName: userRes.data.fullName,
        email: userRes.data.email,
        phone: userRes.data.phone || '',
        address: userRes.data.address || { city: '', street: '', house: '', apartment: '' },
        birthDate: userRes.data.birthDate || '',
        language: userRes.data.language || 'ru',
        notificationSettings: userRes.data.notificationSettings || {
            emailAfisha: true, emailOffers: false, emailReminders: true, push: true, sms: false
        },
        securitySettings: userRes.data.securitySettings || { twoFactorEnabled: false },
        preferences: userRes.data.preferences || { genres: [] }
      });

    } catch (error) {
      console.error("Error loading profile data", error);
    }
  };

  const loadRecommendations = async (genres) => {
      if (genres.length === 0) return;
      try {
          const res = await getEvents({ genre: genres[0], size: 3 });
          setRecommendedEvents(res.data.content || res.data);
      } catch (error) {
          console.error("Error loading recommendations", error);
      }
  };

  const saveField = async (fieldPath, value) => {
      // Don't save if value hasn't changed (deep check might be needed for objects, but simple check for now)
      // Note: Since we update formData on change, we can't easily compare to "previous" without keeping a separate "saved" state.
      // But for simplicity, we'll just save on blur/change.

      // Validate email
      if (fieldPath === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setFieldErrors(prev => ({ ...prev, [fieldPath]: 'Некорректный email' }));
          setFieldStatus(prev => ({ ...prev, [fieldPath]: 'error' }));
          return;
      }

      setFieldStatus(prev => ({ ...prev, [fieldPath]: 'saving' }));
      setFieldErrors(prev => ({ ...prev, [fieldPath]: null }));

      try {
          // Construct the update object based on fieldPath (supports 'address.city' etc)
          let updateData = {};
          if (fieldPath.includes('.')) {
              const [parent, child] = fieldPath.split('.');
              updateData = { 
                  [parent]: { 
                      ...formData[parent], 
                      [child]: value 
                  } 
              };
          } else {
              updateData = { [fieldPath]: value };
          }

          // Special handling for passwords
          if (fieldPath === 'newPassword' || fieldPath === 'confirmPassword') {
             // Don't auto-save passwords until button clicked or handled separately
             return; 
          }

          await updateProfile(updateData);
          
          setFieldStatus(prev => ({ ...prev, [fieldPath]: 'success' }));
          setTimeout(() => {
              setFieldStatus(prev => ({ ...prev, [fieldPath]: 'idle' }));
          }, 2000);

          // Update local user state
          const response = await getProfile();
          setUser(response.data);

      } catch (error) {
          console.error(`Error saving ${fieldPath}`, error);
          setFieldStatus(prev => ({ ...prev, [fieldPath]: 'error' }));
          setFieldErrors(prev => ({ ...prev, [fieldPath]: 'Ошибка сохранения' }));
      }
  };

  const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedInputChange = (parent, child, value) => {
      setFormData(prev => ({ 
          ...prev, 
          [parent]: { ...prev[parent], [child]: value } 
      }));
  };

  const handleBlur = (field) => {
      saveField(field, formData[field]);
  };

  const handleNestedBlur = (parent, child) => {
      saveField(`${parent}.${child}`, formData[parent][child]);
  };

  const handleGenreChange = (genre) => {
      const currentGenres = formData.preferences.genres || [];
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter(g => g !== genre)
        : [...currentGenres, genre];
      
      const newPreferences = { ...formData.preferences, genres: newGenres };
      
      setFormData({ ...formData, preferences: newPreferences });
      saveField('preferences.genres', newGenres); // Immediate save for toggles
  };

  const handleNotificationChange = (key, value) => {
      const newSettings = { ...formData.notificationSettings, [key]: value };
      setFormData({ ...formData, notificationSettings: newSettings });
      saveField(`notificationSettings.${key}`, value);
  };

  const handleChangePassword = async () => {
      if (formData.newPassword !== formData.confirmPassword) {
          alert('Пароли не совпадают');
          return;
      }
      try {
          await updateProfile({ 
              currentPassword: formData.currentPassword, 
              newPassword: formData.newPassword 
          });
          alert('Пароль успешно изменен');
          setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } catch (e) {
          alert('Ошибка смены пароля');
      }
  };

  const handleVote = async (pollId, optionId) => {
      try {
          const res = await votePoll(pollId, optionId);
          setPolls(polls.map(p => p.id === pollId ? res.data : p));
      } catch (error) {
          console.error("Voting failed", error);
      }
  };

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessageText.trim()) return;
      
      try {
          const res = await sendChatMessage(newMessageText);
          setChatMessages([...chatMessages, res.data]);
          setNewMessageText('');
          
          setTimeout(async () => {
              const updatedChat = await getChatHistory();
              setChatMessages(updatedChat.data);
          }, 1500);
      } catch (error) {
          console.error("Message sending failed", error);
      }
  };

  const handleCancelOrder = async (orderId) => {
      if (!window.confirm('Вы уверены, что хотите отменить этот заказ?')) return;
      try {
          await cancelOrder(orderId);
          const res = await getUserOrders();
          setOrders(res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      } catch (e) {
          console.error(e);
          alert('Ошибка отмены заказа');
      }
  };
  
  const handlePayOrder = async (orderId) => {
      try {
          await payOrder(orderId);
          const res = await getUserOrders();
          setOrders(res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
          alert('Заказ успешно оплачен! Билеты отправлены на вашу почту.');
      } catch (e) {
          console.error(e);
          const message = e.response?.data?.message || 'Ошибка оплаты заказа';
          alert(message);
          if (e.response?.status === 401) navigate('/login');
      }
  };

  const handleDeleteOrder = async (orderId) => {
      if (!window.confirm('Вы уверены, что хотите отказаться от заказа? Заказ будет удален.')) return;
      try {
          await deleteOrder(orderId);
          const res = await getUserOrders();
          setOrders(res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      } catch (e) {
          console.error(e);
          const message = e.response?.data?.message || 'Ошибка удаления заказа';
          alert(message);
          if (e.response?.status === 401) navigate('/login');
      }
  };

  const handleAddToCalendar = (order) => {
      const event = order.event;
      const startTime = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
      // Assume 2 hours duration
      const endTime = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
      
      const details = `Билеты: ${order.seats.map(s => `Ряд ${s.row} Место ${s.number}`).join(', ')}. Номер заказа: ${order.ticketNumber}`;
      const location = event.venue;
      
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      
      window.open(url, '_blank');
  };

  const handleShare = (order) => {
      if (navigator.share) {
          navigator.share({
              title: order.event.title,
              text: `Я иду на ${order.event.title} в Филармонию!`,
              url: window.location.origin + '/event/' + order.event.id
          }).catch(console.error);
      } else {
          alert('Ссылка скопирована в буфер обмена!');
      }
  };

  const handlePrint = (order) => {
      const doc = new jsPDF();
      
      // Add a logo or header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("Филармония", 105, 20, null, null, "center");
      
      doc.setFontSize(16);
      doc.text("Электронный билет", 105, 30, null, null, "center");
      
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Event Details
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(order.event.title, 20, 50);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Дата и время: ${new Date(order.event.date).toLocaleString()}`, 20, 60);
      doc.text(`Место проведения: ${order.event.venue}`, 20, 68);
      
      // Order Details
      doc.text(`Номер заказа: ${order.ticketNumber}`, 20, 85);
      doc.text(`Статус: Оплачен`, 20, 93);
      
      // Seats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Места:", 20, 110);
      
      let yPos = 120;
      order.seats.forEach((seat, index) => {
          doc.setFontSize(12);
          doc.text(`Ряд ${seat.row}, Место ${seat.number} (${seat.price} ₽)`, 30, yPos);
          yPos += 8;
      });
      
      doc.line(20, yPos + 5, 190, yPos + 5);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Пожалуйста, предъявите этот билет при входе.", 105, yPos + 15, null, null, "center");
      doc.text("Приятного просмотра!", 105, yPos + 20, null, null, "center");
      
      doc.save(`ticket_${order.ticketNumber}.pdf`);
  };

  // Helper component for fields with status
  const FieldStatus = ({ status, error }) => {
      if (status === 'saving') return <Loader2 size={16} className="animate-spin text-gray-400 ml-2" />;
      if (status === 'success') return <CheckCircle size={16} className="text-green-500 ml-2 animate-bounce" />;
      if (status === 'error') return <span className="text-xs text-red-500 ml-2">{error || 'Ошибка'}</span>;
      return null;
  };

  if (!user) return <div className="text-center py-10 flex justify-center"><Loader2 className="animate-spin mr-2" /> Загрузка профиля...</div>;

  const nextEvent = orders
    .filter(o => o.status === 'paid' || o.status === 'booked')
    .map(o => o.event)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .find(e => new Date(e.date) > new Date());

  const activeTicketsCount = orders.filter(o => (o.status === 'paid' || o.status === 'booked') && new Date(o.event.date) > new Date()).reduce((acc, order) => acc + order.ticketsCount, 0);

  const renderDashboard = () => (
      <div className="space-y-8 animate-fade-in">
          {/* Greeting & Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary to-blue-800 text-white rounded-xl p-6 shadow-lg col-span-1 md:col-span-2">
                  <h2 className="text-2xl font-bold mb-2">Добро пожаловать, {user.fullName || user.username}!</h2>
                  <p className="opacity-90 mb-6">Мы рады видеть вас снова. У вас {user.bonuses || 0} бонусных баллов.</p>
                  <div className="flex gap-4">
                      <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-3xl font-bold">{activeTicketsCount}</div>
                          <div className="text-sm opacity-80">Активных билетов</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-3xl font-bold">{favorites.length}</div>
                          <div className="text-sm opacity-80">В избранном</div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-accent">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      Ближайший концерт
                  </h3>
                  {nextEvent ? (
                      <div>
                          <div className="font-bold text-primary mb-1">{nextEvent.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{new Date(nextEvent.date).toLocaleDateString()}</div>
                          <Link to={`/event/${nextEvent.id}`} className="text-sm text-accent hover:underline">
                              Подробнее &rarr;
                          </Link>
                      </div>
                  ) : (
                      <p className="text-gray-500 text-sm">У вас пока нет предстоящих концертов.</p>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personalized Afisha */}
              <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                      <Music className="mr-2" size={24} />
                      Вам может понравиться
                  </h3>
                  {recommendedEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendedEvents.map(event => (
                              <div key={event.id} className="bg-white rounded-lg shadow p-4 flex gap-4 hover:shadow-md transition">
                                  <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-800 line-clamp-1">{event.title}</h4>
                                      <p className="text-xs text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                                      <Link to={`/event/${event.id}`} className="text-sm text-accent font-medium">
                                          Купить билет
                                      </Link>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                          Укажите ваши музыкальные предпочтения в настройках, чтобы получить персональные рекомендации.
                      </div>
                  )}
              </div>

              {/* Polls */}
              <div>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                      <BarChart2 className="mr-2" size={24} />
                      Опросы
                  </h3>
                  <div className="space-y-4">
                      {polls.map(poll => (
                          <div key={poll.id} className="bg-white rounded-xl shadow p-5">
                              <h4 className="font-bold text-gray-800 mb-3 text-sm">{poll.question}</h4>
                              <div className="space-y-2">
                                  {poll.options.map(option => (
                                      <button
                                          key={option.id}
                                          onClick={() => handleVote(poll.id, option.id)}
                                          className="w-full text-left text-xs p-2 rounded bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition"
                                      >
                                          <span>{option.text}</span>
                                          <span className="text-gray-400 font-mono">{option.votes}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                      {polls.length === 0 && <p className="text-gray-500 text-sm">Сейчас нет активных опросов.</p>}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center">
              <User className="mr-2" /> Настройки профиля
          </h2>
          
          <div className="flex border-b mb-6 overflow-x-auto">
              {['basic', 'contact', 'notifications', 'security'].map(tab => (
                  <button
                      key={tab}
                      onClick={() => setSettingsTab(tab)}
                      className={`px-4 py-2 font-medium text-sm transition whitespace-nowrap ${
                          settingsTab === tab 
                          ? 'text-accent border-b-2 border-accent' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                      {tab === 'basic' && 'Основная информация'}
                      {tab === 'contact' && 'Контактные данные'}
                      {tab === 'notifications' && 'Уведомления'}
                      {tab === 'security' && 'Безопасность'}
                  </button>
              ))}
          </div>

          <div className="min-h-[400px]">
              {settingsTab === 'basic' && (
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              ФИО
                              <FieldStatus status={fieldStatus.fullName} error={fieldErrors.fullName} />
                          </label>
                          <input
                              type="text"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${fieldStatus.fullName === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                              value={formData.fullName}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              onBlur={() => handleBlur('fullName')}
                          />
                          <p className="text-xs text-gray-500 mt-1">Как к вам обращаться в билетах и письмах</p>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              Дата рождения
                              <FieldStatus status={fieldStatus.birthDate} error={fieldErrors.birthDate} />
                          </label>
                          <input
                              type="date"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${fieldStatus.birthDate === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                              value={formData.birthDate}
                              onChange={(e) => handleInputChange('birthDate', e.target.value)}
                              onBlur={() => handleBlur('birthDate')}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              Язык интерфейса
                              <FieldStatus status={fieldStatus.language} error={fieldErrors.language} />
                          </label>
                          <select
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              value={formData.language}
                              onChange={(e) => {
                                  handleInputChange('language', e.target.value);
                                  saveField('language', e.target.value);
                              }}
                          >
                              <option value="ru">Русский 🇷🇺</option>
                              <option value="en">English 🇬🇧</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Музыкальные предпочтения</label>
                          <div className="flex flex-wrap gap-2">
                              {['Классика', 'Джаз', 'Рок', 'Фолк', 'Опера'].map(genre => (
                                  <button
                                      key={genre}
                                      type="button"
                                      onClick={() => handleGenreChange(genre)}
                                      className={`px-3 py-1 rounded-full text-sm border transition ${
                                          formData.preferences?.genres?.includes(genre)
                                          ? 'bg-accent text-white border-accent'
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                      {genre}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {settingsTab === 'contact' && (
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              Email
                              <FieldStatus status={fieldStatus.email} error={fieldErrors.email} />
                          </label>
                          <input
                              type="email"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${fieldStatus.email === 'error' ? 'border-red-300 bg-red-50' : ''} ${fieldStatus.email === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              onBlur={() => handleBlur('email')}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              Телефон
                              <FieldStatus status={fieldStatus.phone} error={fieldErrors.phone} />
                          </label>
                          <input
                              type="tel"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${fieldStatus.phone === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              onBlur={() => handleBlur('phone')}
                              placeholder="+7 (999) 000-00-00"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  Город
                                  <FieldStatus status={fieldStatus['address.city']} />
                              </label>
                              <input
                                  type="text"
                                  className={`w-full px-4 py-2 border rounded-lg ${fieldStatus['address.city'] === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                                  value={formData.address.city}
                                  onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                                  onBlur={() => handleNestedBlur('address', 'city')}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  Улица
                                  <FieldStatus status={fieldStatus['address.street']} />
                              </label>
                              <input
                                  type="text"
                                  className={`w-full px-4 py-2 border rounded-lg ${fieldStatus['address.street'] === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                                  value={formData.address.street}
                                  onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                                  onBlur={() => handleNestedBlur('address', 'street')}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  Дом
                                  <FieldStatus status={fieldStatus['address.house']} />
                              </label>
                              <input
                                  type="text"
                                  className={`w-full px-4 py-2 border rounded-lg ${fieldStatus['address.house'] === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                                  value={formData.address.house}
                                  onChange={(e) => handleNestedInputChange('address', 'house', e.target.value)}
                                  onBlur={() => handleNestedBlur('address', 'house')}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  Квартира
                                  <FieldStatus status={fieldStatus['address.apartment']} />
                              </label>
                              <input
                                  type="text"
                                  className={`w-full px-4 py-2 border rounded-lg ${fieldStatus['address.apartment'] === 'success' ? 'border-green-300 bg-green-50' : ''}`}
                                  value={formData.address.apartment}
                                  onChange={(e) => handleNestedInputChange('address', 'apartment', e.target.value)}
                                  onBlur={() => handleNestedBlur('address', 'apartment')}
                              />
                          </div>
                      </div>
                  </div>
              )}

              {settingsTab === 'notifications' && (
                  <div className="space-y-4">
                      {Object.entries({
                          emailAfisha: 'Рассылка афиши',
                          emailOffers: 'Специальные предложения',
                          emailReminders: 'Напоминания о концертах',
                          push: 'Push-уведомления',
                          sms: 'SMS-оповещения'
                      }).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                              <div>
                                  <div className="font-medium text-gray-700">{label}</div>
                                  <div className="text-xs text-gray-500">
                                      {key.includes('email') ? 'Приходит на почту' : key === 'push' ? 'Всплывающие уведомления' : 'На телефон'}
                                  </div>
                              </div>
                              <div className="flex items-center">
                                  <FieldStatus status={fieldStatus[`notificationSettings.${key}`]} />
                                  <div className="relative inline-block w-10 ml-2 align-middle select-none transition duration-200 ease-in">
                                      <input 
                                          type="checkbox" 
                                          checked={formData.notificationSettings[key]}
                                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4"
                                          style={{right: formData.notificationSettings[key] ? '0' : 'auto', left: formData.notificationSettings[key] ? 'auto' : '0'}}
                                      />
                                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.notificationSettings[key] ? 'bg-accent' : 'bg-gray-300'}`}></label>
                                  </div>
                              </div>
                          </div>
                      ))}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <h4 className="text-sm font-bold text-gray-600 mb-2">Предпросмотр уведомления</h4>
                          <div className="bg-white p-3 rounded shadow-sm text-sm border-l-4 border-primary">
                              <p className="font-bold text-gray-800">Напоминание о концерте</p>
                              <p className="text-gray-600">Завтра состоится концерт "Времена года". Не забудьте билеты!</p>
                          </div>
                      </div>
                  </div>
              )}

              {settingsTab === 'security' && (
                  <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                          <h3 className="font-bold text-gray-700 flex items-center"><Lock size={16} className="mr-2"/> Смена пароля</h3>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                              <input
                                  type="password"
                                  className="w-full px-4 py-2 border rounded-lg"
                                  value={formData.currentPassword}
                                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                              <input
                                  type="password"
                                  className="w-full px-4 py-2 border rounded-lg"
                                  value={formData.newPassword}
                                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
                              <input
                                  type="password"
                                  className="w-full px-4 py-2 border rounded-lg"
                                  value={formData.confirmPassword}
                                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              />
                          </div>
                          <button
                              onClick={handleChangePassword}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-secondary transition"
                          >
                              Обновить пароль
                          </button>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-4">
                              <div>
                                  <div className="font-bold text-gray-800 flex items-center"><Shield size={16} className="mr-2"/> Двухфакторная аутентификация</div>
                                  <div className="text-xs text-gray-500">Дополнительная защита вашего аккаунта</div>
                              </div>
                              <button 
                                  type="button"
                                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${formData.securitySettings.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                  onClick={() => {
                                      const newVal = !formData.securitySettings.twoFactorEnabled;
                                      setFormData(prev => ({ ...prev, securitySettings: { ...prev.securitySettings, twoFactorEnabled: newVal } }));
                                      saveField('securitySettings.twoFactorEnabled', newVal);
                                  }}
                              >
                                  {formData.securitySettings.twoFactorEnabled ? 'Включена' : 'Выключена'}
                              </button>
                          </div>
                          
                          {formData.securitySettings.twoFactorEnabled && (
                              <div className="mt-4 p-4 bg-white rounded border border-blue-100 animate-fade-in">
                                  <p className="text-sm text-gray-700 mb-3">1. Установите Google Authenticator</p>
                                  <p className="text-sm text-gray-700 mb-3">2. Отсканируйте этот QR-код:</p>
                                  <div className="w-32 h-32 bg-gray-200 mx-auto mb-3 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed">
                                      QR Code Placeholder
                                  </div>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="Введите код из приложения" className="flex-1 px-3 py-1 border rounded text-sm"/>
                                      <button type="button" className="bg-primary text-white px-3 py-1 rounded text-sm">Подтвердить</button>
                                  </div>
                              </div>
                          )}
                      </div>

                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-sm text-gray-700">Активные сеансы</h4>
                              <button type="button" className="text-xs text-red-500 hover:underline">Завершить все сеансы</button>
                          </div>
                          <div className="space-y-2">
                              {activeSessions.map(session => (
                                  <div key={session.id} className="text-sm flex items-center justify-between p-3 bg-gray-50 rounded border">
                                      <div className="flex items-center">
                                          <session.icon size={16} className="mr-3 text-gray-500"/>
                                          <div>
                                              <div className="font-medium text-gray-800">{session.device}</div>
                                              <div className="text-xs text-gray-500">{session.ip} • {session.lastActive}</div>
                                          </div>
                                      </div>
                                      {session.id === 1 && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Текущий</span>}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  const renderChat = () => (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] max-w-4xl mx-auto">
          <div className="p-4 bg-primary text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center">
                  <MessageSquare className="mr-2" /> Служба поддержки
              </h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Онлайн</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                      История сообщений пуста. Напишите нам, если у вас возникли вопросы.
                  </div>
              )}
              {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === 'user' 
                          ? 'bg-accent text-white rounded-tr-none' 
                          : 'bg-white border text-gray-800 rounded-tl-none'
                      }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Введите ваше сообщение..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <button 
                      type="submit"
                      disabled={!newMessageText.trim()}
                      className="bg-primary text-white p-2 rounded-lg hover:bg-secondary transition disabled:opacity-50"
                  >
                      <Send size={20} />
                  </button>
              </form>
          </div>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                  <nav className="space-y-2">
                      <button
                          onClick={() => setActiveTab('dashboard')}
                          className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                              activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <LayoutDashboard size={20} className="mr-3" />
                          Обзор
                      </button>
                      <button
                          onClick={() => setActiveTab('tickets')}
                          className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                              activeTab === 'tickets' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <Ticket size={20} className="mr-3" />
                          Мои билеты
                      </button>
                      <button
                          onClick={() => setActiveTab('settings')}
                          className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                              activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <Settings size={20} className="mr-3" />
                          Настройки
                      </button>
                      <button
                          onClick={() => setActiveTab('chat')}
                          className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                              activeTab === 'chat' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <MessageSquare size={20} className="mr-3" />
                          Поддержка
                      </button>
                  </nav>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'chat' && renderChat()}
              {activeTab === 'tickets' && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-2xl font-bold mb-6 text-primary flex items-center">
                          <Ticket className="mr-2" /> История заказов
                      </h2>
                      {orders.length === 0 ? (
                          <div className="bg-white rounded-xl shadow-lg p-10 text-center text-gray-500">
                              <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                              <p>У вас пока нет заказов.</p>
                              <Link to="/" className="text-accent hover:underline mt-2 inline-block">Перейти к афише</Link>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {orders.map(order => {
                                  let statusColor = 'bg-gray-100 text-gray-800';
                                  let statusText = 'Неизвестно';
                                  let StatusIcon = AlertTriangle;

                                  if (order.status === 'paid') {
                                      statusColor = 'bg-green-100 text-green-800';
                                      statusText = 'Оплачен';
                                      StatusIcon = CheckCircle;
                                  } else if (order.status === 'booked') {
                                      statusColor = 'bg-yellow-100 text-yellow-800';
                                      statusText = 'В брони';
                                      StatusIcon = Clock;
                                  } else if (order.status === 'cancelled') {
                                      statusColor = 'bg-red-100 text-red-800';
                                      statusText = 'Аннулирован';
                                      StatusIcon = XCircle;
                                  }

                                  return (
                                      <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                                          <div className="p-6">
                                              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                                  <div>
                                                      <div className="flex items-center gap-2 mb-1">
                                                          <span className={`px-2 py-1 rounded text-xs font-bold flex items-center ${statusColor}`}>
                                                              <StatusIcon size={12} className="mr-1" /> {statusText}
                                                          </span>
                                                          <span className="text-xs text-gray-500">№ {order.ticketNumber}</span>
                                                      </div>
                                                      <h3 className="text-xl font-bold text-primary">{order.event.title}</h3>
                                                      <div className="text-gray-600 flex items-center mt-1">
                                                          <Calendar size={14} className="mr-1" />
                                                          {new Date(order.event.date).toLocaleDateString()} {new Date(order.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                      </div>
                                                      <div className="text-gray-600 flex items-center mt-1">
                                                          <MapPin size={14} className="mr-1" />
                                                          {order.event.venue}
                                                      </div>
                                                  </div>
                                                  <div className="text-right">
                                                      <div className="text-2xl font-bold text-gray-800">{order.totalPrice} ₽</div>
                                                      <div className="text-xs text-gray-500">{order.ticketsCount} билетов</div>
                                                  </div>
                                              </div>

                                              {/* Seats Details */}
                                              {order.seats && order.seats.length > 0 && (
                                                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                                                      <div className="font-semibold text-gray-700 mb-2">Места:</div>
                                                      <div className="flex flex-wrap gap-2">
                                                          {order.seats.map((seat, i) => (
                                                              <span key={i} className="bg-white border px-2 py-1 rounded text-xs text-gray-600">
                                                                  Ряд {seat.row}, Место {seat.number}
                                                              </span>
                                                          ))}
                                                      </div>
                                                  </div>
                                              )}

                                              {/* Actions */}
                                              <div className="flex flex-wrap gap-3 pt-4 border-t">
                                                  {order.status === 'paid' && (
                                                      <>
                                                          <button onClick={() => handlePrint(order)} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                                                              <Printer size={16} className="mr-2" /> Распечатать
                                                          </button>
                                                          <button onClick={() => handleAddToCalendar(order)} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                                                              <Calendar size={16} className="mr-2" /> В календарь
                                                          </button>
                                                          <button onClick={() => handleShare(order)} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                                                              <Share2 size={16} className="mr-2" /> Поделиться
                                                          </button>
                                                      </>
                                                  )}
                                                  {order.status === 'booked' && (
                                                      <>
                                                          <button 
                                                              onClick={() => handlePayOrder(order.id)}
                                                              className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                                          >
                                                              <CreditCard size={16} className="mr-2" /> Оплатить онлайн
                                                          </button>
                                                          <button 
                                                              onClick={() => handleCancelOrder(order.id)}
                                                              className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                                          >
                                                              <XCircle size={16} className="mr-2" /> Отменить бронь
                                                          </button>
                                                          <div className="ml-auto text-right">
                                                              <div className="text-xs text-orange-600 flex items-center justify-end mb-1">
                                                                  <Clock size={12} className="mr-1" />
                                                                  Бронь истекает: {new Date(order.bookingExpiresAt).toLocaleString()}
                                                              </div>
                                                              <div className="text-xs text-gray-500">
                                                                  Выкуп в кассе: ул. Ленина, 1.<br/>Ежедневно 10:00 - 20:00
                                                              </div>
                                                          </div>
                                                      </>
                                                  )}
                                                  <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium">
                                                      <Trash2 size={16} className="mr-2" /> Отказаться
                                                  </button>
                                                  <button onClick={() => setActiveTab('chat')} className="flex items-center px-4 py-2 text-primary hover:text-secondary transition text-sm font-medium ml-auto">
                                                      <MessageSquare size={16} className="mr-2" /> Поддержка
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Profile;
