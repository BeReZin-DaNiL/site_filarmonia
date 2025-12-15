import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/news/${id}`);
        setNewsItem(response.data);
      } catch (error) {
        console.error('Error fetching news details:', error);
        setError('Новость не найдена');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Новость не найдена'}</h2>
        <Link to="/news" className="text-accent hover:underline">Вернуться к списку новостей</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate('/news')}
          className="flex items-center text-gray-600 hover:text-accent mb-8 transition group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition" />
          Назад к новостям
        </button>

        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-64 md:h-96 relative">
            <img 
              src={newsItem.image} 
              alt={newsItem.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-8 text-white w-full">
                <div className="flex items-center mb-4 text-white/90">
                  <Calendar size={18} className="mr-2" />
                  <span className="font-medium">{new Date(newsItem.date).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight shadow-sm">
                  {newsItem.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none text-gray-700">
               <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
            </div>

            <div className="mt-12 pt-8 border-t flex justify-between items-center">
              <div className="text-gray-500 italic">
                Информационная служба филармонии
              </div>
              <button className="flex items-center text-gray-600 hover:text-accent transition">
                <Share2 size={20} className="mr-2" />
                Поделиться
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetails;
