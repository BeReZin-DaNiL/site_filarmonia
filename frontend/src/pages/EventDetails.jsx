import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, createOrder, getFavorites, addToFavorites, removeFromFavorites, getEventReviews, addEventReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, Heart, Star, Send, X, CreditCard, Clock, MapPin, Users, Info, Music } from 'lucide-react';
import SeatingChart from '../components/SeatingChart';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Booking State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'booking'

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadEvent();
    loadReviews();
    if (user) {
        checkFavorite();
    }
  }, [id, user]);

  const checkFavorite = async () => {
      try {
          const response = await getFavorites();
          const favorites = response.data;
          setIsFavorite(favorites.some(f => f.id === parseInt(id)));
      } catch (error) {
          console.error(error);
      }
  };

  const toggleFavorite = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      try {
          if (isFavorite) {
              await removeFromFavorites(id);
              setIsFavorite(false);
          } else {
              await addToFavorites(id);
              setIsFavorite(true);
          }
      } catch (error) {
          console.error(error);
      }
  };

  const loadEvent = async () => {
    try {
      const response = await getEvent(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
      try {
          const res = await getEventReviews(id);
          setReviews(res.data);
      } catch (e) {
          console.error("Error loading reviews", e);
      }
  };

  const handleOpenBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleSelectSeat = (seat) => {
    if (selectedSeats.find(s => s.row === seat.row && s.number === seat.number)) {
        setSelectedSeats(selectedSeats.filter(s => s.row !== seat.row || s.number !== seat.number));
    } else {
        setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleConfirmOrder = async () => {
    if (selectedSeats.length === 0) {
        alert('Пожалуйста, выберите хотя бы одно место');
        return;
    }
    
    try {
        await createOrder({
            eventId: event.id,
            seats: selectedSeats,
            paymentMethod,
            status: paymentMethod === 'online' ? 'paid' : 'booked'
        });
        alert(paymentMethod === 'online' ? 'Билеты успешно оплачены! Отправлены на вашу почту.' : 'Билеты забронированы! У вас есть 48 часов на выкуп.');
        navigate('/profile'); 
    } catch (error) {
        console.error(error);
        const message = error.response?.data?.message || 'Ошибка при оформлении заказа';
        alert(message);
        
        if (error.response?.status === 401) {
            navigate('/login');
        }
    }
  };

  const handleAddReview = async (e) => {
      e.preventDefault();
      if (!user) {
          navigate('/login');
          return;
      }
      if (!reviewComment.trim()) return;

      try {
          const res = await addEventReview(id, { rating: reviewRating, comment: reviewComment });
          setReviews([...reviews, res.data]);
          setReviewComment('');
          setReviewRating(5);
      } catch (e) {
          console.error(e);
          alert('Ошибка при добавлении отзыва');
      }
  };

  if (loading) return <div className="text-center py-10">Загрузка...</div>;
  if (!event) return <div className="text-center py-10">Мероприятие не найдено</div>;

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto mb-8">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 relative">
             {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-gray-500">
                        No Image
                    </div>
                )}
          </div>
          <div className="p-8 md:w-1/2 flex flex-col">
            <div className="flex items-center text-accent font-semibold mb-2">
              <Calendar className="mr-2" size={20} />
              {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <h1 className="text-3xl font-bold mb-4 text-primary leading-tight">{event.title}</h1>
            
            <div className="flex space-x-4 mb-6">
                <button 
                    onClick={toggleFavorite}
                    className={`flex items-center px-4 py-2 rounded-full border transition ${
                        isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-500' 
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <Heart size={20} className={`mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
            </div>

            <p className="text-gray-600 mb-6 flex-grow">{event.description}</p>
            
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
                <div className="flex items-center"><Music className="w-5 mr-3 text-gray-400" /> <span className="font-semibold w-24 text-gray-700">Жанр:</span> <span>{event.genre || 'Не указан'}</span></div>
                <div className="flex items-center"><MapPin className="w-5 mr-3 text-gray-400" /> <span className="font-semibold w-24 text-gray-700">Место:</span> <span>{event.venue || 'Большой зал'}</span></div>
                <div className="flex items-center"><Users className="w-5 mr-3 text-gray-400" /> <span className="font-semibold w-24 text-gray-700">Исполнители:</span> <span>{event.performers || 'Симфонический оркестр'}</span></div>
                <div className="flex items-center"><Clock className="w-5 mr-3 text-gray-400" /> <span className="font-semibold w-24 text-gray-700">Длительность:</span> <span>{event.duration || '1 час 30 минут'}</span></div>
                <div className="flex items-center"><Info className="w-5 mr-3 text-gray-400" /> <span className="font-semibold w-24 text-gray-700">Возраст:</span> <span>{event.ageRestriction || '6+'}</span></div>
            </div>

            <div className="border-t pt-6 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-sm text-gray-500 block">Цена билета от</span>
                    <span className="text-2xl font-bold text-primary">{event.price} ₽</span>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500 block">Осталось билетов</span>
                    <span className="text-lg font-semibold text-gray-700">{event.availableTickets}</span>
                </div>
              </div>

              <button 
                onClick={handleOpenBooking}
                disabled={event.availableTickets === 0}
                className="w-full bg-accent text-white py-4 rounded-lg font-bold text-lg hover:bg-red-600 transition flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ticket className="mr-2" />
                {event.availableTickets > 0 ? 'Выбрать места и купить' : 'Билеты закончились'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-primary">Отзывы и оценки</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  {reviews.length === 0 ? (
                      <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
                  ) : (
                      <div className="space-y-6">
                          {reviews.map(review => (
                              <div key={review.id} className="border-b pb-4 last:border-0">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="font-bold text-gray-800">{review.fullName || review.username}</span>
                                      <div className="flex text-yellow-400">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                          ))}
                                      </div>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                                  <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl h-fit">
                  <h3 className="font-bold text-lg mb-4">Оставить отзыв</h3>
                  {user ? (
                      <form onSubmit={handleAddReview} className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ваша оценка</label>
                              <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                      <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewRating(star)}
                                          className={`transition transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      >
                                          <Star size={24} fill={star <= reviewRating ? "currentColor" : "none"} />
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                              <textarea
                                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                  rows="4"
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Поделитесь своими впечатлениями..."
                              ></textarea>
                          </div>
                          <button
                              type="submit"
                              disabled={!reviewComment.trim()}
                              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 flex justify-center items-center"
                          >
                              <Send size={18} className="mr-2" />
                              Отправить
                          </button>
                      </form>
                  ) : (
                      <div className="text-center py-6 text-gray-500">
                          <p className="mb-4">Пожалуйста, войдите, чтобы оставить отзыв.</p>
                          <button 
                              onClick={() => navigate('/login')}
                              className="text-accent font-medium hover:underline"
                          >
                              Войти
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 bg-primary text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold flex items-center">
                        <Ticket className="mr-2" /> Выбор мест: {event.title}
                    </h2>
                    <button onClick={() => setShowBookingModal(false)} className="hover:bg-white/20 p-1 rounded transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 overflow-x-auto">
                            <SeatingChart 
                                eventId={event.id} 
                                selectedSeats={selectedSeats} 
                                onSelectSeat={handleSelectSeat} 
                            />
                        </div>
                        
                        <div className="w-full lg:w-80 shrink-0 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="font-bold text-lg mb-4">Ваш заказ</h3>
                                {selectedSeats.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Выберите места на схеме</p>
                                ) : (
                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                        {selectedSeats.map((seat, idx) => (
                                            <div key={idx} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                                <span>Ряд {seat.row}, Место {seat.number}</span>
                                                <span className="font-bold">{seat.price} ₽</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center text-xl font-bold text-primary">
                                        <span>Итого:</span>
                                        <span>{totalPrice} ₽</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="font-bold text-lg mb-4">Способ оплаты</h3>
                                <div className="space-y-3">
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'online' ? 'border-accent bg-red-50 ring-1 ring-accent' : 'hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="online" 
                                            checked={paymentMethod === 'online'} 
                                            onChange={() => setPaymentMethod('online')}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-semibold flex items-center"><CreditCard size={16} className="mr-2" /> Онлайн-оплата</div>
                                            <div className="text-xs text-gray-500">Банковская карта, SberPay</div>
                                        </div>
                                    </label>

                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'booking' ? 'border-accent bg-red-50 ring-1 ring-accent' : 'hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="booking" 
                                            checked={paymentMethod === 'booking'} 
                                            onChange={() => setPaymentMethod('booking')}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-semibold flex items-center"><Clock size={16} className="mr-2" /> Забронировать</div>
                                            <div className="text-xs text-gray-500">Выкуп в кассе в течение 48 часов</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirmOrder}
                                disabled={selectedSeats.length === 0}
                                className="w-full bg-accent text-white py-3 rounded-lg font-bold shadow-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paymentMethod === 'online' ? 'Оплатить билеты' : 'Подтвердить бронь'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;