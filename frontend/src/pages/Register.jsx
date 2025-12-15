import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
        setError('Необходимо принять условия пользовательского соглашения');
        return;
    }
    try {
      const response = await registerApi(formData);
      login(response.data);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 409) {
          setError('Это имя пользователя уже занято. Пожалуйста, выберите другое.');
      } else if (err.response && err.response.data && err.response.data.message) {
          setError(`Ошибка: ${err.response.data.message}`);
      } else {
          setError('Ошибка подключения к серверу. Пожалуйста, попробуйте позже.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Регистрация</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input 
                type="checkbox" 
                id="agreement" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2"
            />
            <label htmlFor="agreement" className="text-sm text-gray-600">
                Я принимаю <a href="#" className="text-accent hover:underline">пользовательское соглашение</a> и <a href="#" className="text-accent hover:underline">политику конфиденциальности</a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;