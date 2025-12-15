import { useState, useEffect } from 'react';
import { getUserOrders } from '../services/api';
import { Ticket, Calendar } from 'lucide-react';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getUserOrders();
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-primary">Мои билеты</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">{order.event.title}</h3>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar size={16} className="mr-2" />
                {new Date(order.event.date).toLocaleDateString()} {new Date(order.event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="flex items-center text-gray-600">
                <Ticket size={16} className="mr-2" />
                {order.ticketsCount} билетов
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{order.totalPrice} ₽</div>
              <div className="text-sm text-gray-500">Заказ от {new Date(order.orderDate).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-10">У вас пока нет купленных билетов</p>
        )}
      </div>
    </div>
  );
};

export default UserOrders;