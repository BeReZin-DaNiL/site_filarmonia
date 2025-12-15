import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ArrowRight } from 'lucide-react';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/news');
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Загрузка новостей...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Новости и события</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Будьте в курсе последних событий из жизни филармонии. Анонсы концертов, отчеты о прошедших мероприятиях и интересные статьи о музыке.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <Link 
            to={`/news/${item.id}`} 
            key={item.id}
            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary flex items-center shadow-sm">
                <Calendar size={14} className="mr-2 text-accent" />
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition duration-300 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {item.summary}
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-accent font-semibold group-hover:translate-x-2 transition duration-300">
                Читать далее <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
