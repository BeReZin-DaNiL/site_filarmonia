import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search, FileText, HelpCircle } from 'lucide-react';

const AdminContent = () => {
    const [activeTab, setActiveTab] = useState('news');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Управление контентом</h1>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex space-x-1 w-fit">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'news'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <FileText size={18} className="mr-2" />
                    Новости
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'faq'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <HelpCircle size={18} className="mr-2" />
                    Частые вопросы (FAQ)
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                {activeTab === 'news' ? <NewsManager /> : <FAQManager />}
            </div>
        </div>
    );
};

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNews, setCurrentNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Ошибка при удалении новости');
        }
    };

    const handleEdit = (item) => {
        setCurrentNews(item);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setCurrentNews({ title: '', date: new Date().toISOString().split('T')[0], summary: '', content: '', image: '' });
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (currentNews.id) {
                await axios.put(`http://localhost:8080/api/news/${currentNews.id}`, currentNews, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8080/api/news', currentNews, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsEditing(false);
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Ошибка при сохранении новости');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Загрузка новостей...</div>;

    if (isEditing) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{currentNews.id ? 'Редактировать новость' : 'Добавить новость'}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                        <input
                            type="text"
                            value={currentNews.title}
                            onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                        <input
                            type="date"
                            value={currentNews.date}
                            onChange={(e) => setCurrentNews({ ...currentNews, date: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
                        <textarea
                            value={currentNews.summary}
                            onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-24"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Полный контент (HTML)</label>
                        <textarea
                            value={currentNews.content}
                            onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-48 font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Поддерживаются теги HTML: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на изображение</label>
                        <input
                            type="text"
                            value={currentNews.image}
                            onChange={(e) => setCurrentNews({ ...currentNews, image: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-red-700 transition"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Добавить новость
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="pb-3 font-semibold text-gray-600">Заголовок</th>
                            <th className="pb-3 font-semibold text-gray-600 w-32">Дата</th>
                            <th className="pb-3 font-semibold text-gray-600 w-24 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {news.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="py-4 pr-4">
                                    <div className="font-medium text-gray-800">{item.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-md">{item.summary}</div>
                                </td>
                                <td className="py-4 text-gray-600">{item.date}</td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Редактировать"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Удалить"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {news.length === 0 && (
                    <div className="text-center py-10 text-gray-500">Новости отсутствуют</div>
                )}
            </div>
        </div>
    );
};

const FAQManager = () => {
    const [faq, setFaq] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFaq, setCurrentFaq] = useState(null);

    useEffect(() => {
        fetchFaq();
    }, []);

    const fetchFaq = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/faq');
            setFaq(response.data);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот вопрос?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/faq/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFaq();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            alert('Ошибка при удалении вопроса');
        }
    };

    const handleEdit = (item) => {
        setCurrentFaq(item);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setCurrentFaq({ question: '', answer: '' });
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (currentFaq.id) {
                await axios.put(`http://localhost:8080/api/faq/${currentFaq.id}`, currentFaq, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8080/api/faq', currentFaq, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsEditing(false);
            fetchFaq();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            alert('Ошибка при сохранении вопроса');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Загрузка FAQ...</div>;

    if (isEditing) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{currentFaq.id ? 'Редактировать вопрос' : 'Добавить вопрос'}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Вопрос</label>
                        <input
                            type="text"
                            value={currentFaq.question}
                            onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ответ</label>
                        <textarea
                            value={currentFaq.answer}
                            onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-32"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-red-700 transition"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Добавить вопрос
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="pb-3 font-semibold text-gray-600">Вопрос</th>
                            <th className="pb-3 font-semibold text-gray-600 text-right w-24">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {faq.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="py-4 pr-4">
                                    <div className="font-medium text-gray-800">{item.question}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-3xl">{item.answer}</div>
                                </td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Редактировать"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Удалить"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {faq.length === 0 && (
                    <div className="text-center py-10 text-gray-500">Вопросы отсутствуют</div>
                )}
            </div>
        </div>
    );
};

export default AdminContent;
