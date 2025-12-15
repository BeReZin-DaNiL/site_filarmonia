import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin/content', label: 'Контент', icon: '📝' },
    { path: '/admin/orders', label: 'Заказы', icon: '📦' },
    { path: '/admin/users', label: 'Пользователи', icon: '👥' },
    { path: '/admin/events', label: 'Мероприятия', icon: '🎭' },
    { path: '/admin/reports', label: 'Отчёты', icon: '📊' },
    { path: '/admin/db', label: 'База данных', icon: '💾' },
    { path: '/admin/settings', label: 'Настройки системы', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Панель администратора</h2>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Link to="/" className="flex items-center p-2 text-gray-600 hover:text-red-600 transition-colors">
            <span>← Вернуться на сайт</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
