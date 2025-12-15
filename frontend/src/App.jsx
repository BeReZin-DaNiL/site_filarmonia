import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import UserOrders from './pages/UserOrders';
import Profile from './pages/Profile';
import InfoPage from './pages/InfoPage';
import NewsList from './pages/NewsList';
import NewsDetails from './pages/NewsDetails';
import FAQ from './pages/FAQ';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminEvents from './pages/admin/AdminEvents';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminSettings from './pages/admin/AdminSettings';
import AdminContent from './pages/admin/AdminContent';
import Placeholder from './pages/admin/Placeholder';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdminRoute && <Navbar />}
      <div className={isAdminRoute ? "h-screen" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/about" element={<InfoPage title="О филармонии" content={
            <div>
              <p className="mb-4">Наша филармония — это центр музыкальной культуры города, основанный в 1937 году. Мы гордимся богатой историей и выдающимися исполнителями, которые выступали на нашей сцене.</p>
              <p className="mb-4">В состав филармонии входят симфонический оркестр, камерный хор и ансамбль народных инструментов. Ежегодно мы проводим более 200 концертов, фестивалей и образовательных программ для слушателей всех возрастов.</p>
              <p>Мы стремимся сохранять традиции классического искусства и открывать новые имена в мире музыки.</p>
            </div>
          } />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/contacts" element={<InfoPage title="Контакты" content={
            <div>
              <p className="mb-2"><strong>Адрес:</strong> г. Москва, ул. Музыкальная, д. 1</p>
              <p className="mb-2"><strong>Касса:</strong> +7 (495) 123-45-67 (ежедневно с 10:00 до 20:00)</p>
              <p className="mb-2"><strong>Приемная:</strong> +7 (495) 123-45-68</p>
              <p className="mb-2"><strong>Email:</strong> info@philharmonia.ru</p>
            </div>
          } />} />
          <Route path="/faq" element={<FAQ />} />
          {user && <Route path="/orders" element={<UserOrders />} />}
          {user && <Route path="/profile" element={<Profile />} />}
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Placeholder title="Панель управления" />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="db" element={<AdminDatabase />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!isAdminRoute && (
        <footer className="bg-secondary text-white py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Информационно-справочная система филармонии. Все права защищены.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;