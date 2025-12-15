import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, ChevronDown, Ticket, Settings, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/", label: "Афиша" },
    { to: "/about", label: "О филармонии" },
    { to: "/news", label: "Новости" },
    { to: "/contacts", label: "Контакты" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:bg-red-600 transition transform group-hover:scale-105">
              Ph
            </div>
            <span className="text-2xl font-bold tracking-tight">Philharmonic</span>
          </Link>
          
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="px-4 py-2 rounded-full hover:bg-white/20 transition text-sm font-medium whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions - Right */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-xl transition"
                >
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-bold leading-none">{user.fullName || user.username}</div>
                    <div className="text-xs text-gray-300 opacity-80">{user.role === 'ADMIN' ? 'Администратор' : 'Зритель'}</div>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b mb-2 bg-gray-50">
                      <p className="text-sm text-gray-500">Вы вошли как</p>
                      <p className="text-sm font-bold truncate">{user.email || user.username}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 hover:bg-red-50 hover:text-accent transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={18} className="mr-3" /> Профиль
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center px-4 py-2 hover:bg-red-50 hover:text-accent transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Ticket size={18} className="mr-3" /> Мои билеты
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-2 hover:bg-red-50 hover:text-accent transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield size={18} className="mr-3" /> Админ панель
                      </Link>
                    )}
                    
                    <div className="border-t mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={18} className="mr-3" /> Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-5 py-2 rounded-lg hover:bg-white/10 transition font-medium"
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-red-600 transition shadow-lg transform hover:-translate-y-0.5 font-bold"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 animate-in slide-in-from-top-5">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="block px-4 py-3 rounded-lg hover:bg-white/10 transition text-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-white/10 pt-4 mt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center px-4 mb-4">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-bold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{user.fullName || user.username}</div>
                      <div className="text-xs opacity-70">{user.email}</div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={20} className="mr-3" /> Профиль
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <Ticket size={20} className="mr-3" /> Мои билеты
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield size={20} className="mr-3" /> Админ панель
                    </Link>
                  )}
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-3 rounded-lg text-red-300 hover:bg-white/10 transition"
                  >
                    <LogOut size={20} className="mr-3" /> Выйти
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/login" 
                    className="text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Вход
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-center py-3 bg-accent rounded-lg hover:bg-red-600 transition shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;