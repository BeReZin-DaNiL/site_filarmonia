import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки настроек' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/admin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Настройки успешно сохранены' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Загрузка...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Настройки системы</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-red-700'
                    }`}
                >
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* General Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Общие настройки</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название сайта</label>
                        <input
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Режим обслуживания</label>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                checked={settings.general.maintenanceMode}
                                onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-gray-600">Включить режим "Технические работы"</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email поддержки</label>
                        <input
                            type="email"
                            value={settings.general.supportEmail}
                            onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон поддержки</label>
                        <input
                            type="text"
                            value={settings.general.supportPhone}
                            onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Настройки бронирования</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Макс. билетов в заказе</label>
                        <input
                            type="number"
                            value={settings.booking.maxTicketsPerOrder}
                            onChange={(e) => handleChange('booking', 'maxTicketsPerOrder', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тайм-аут брони (мин)</label>
                        <input
                            type="number"
                            value={settings.booking.reservationTimeoutMinutes}
                            onChange={(e) => handleChange('booking', 'reservationTimeoutMinutes', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Возврат билетов</label>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                checked={settings.booking.enableRefunds}
                                onChange={(e) => handleChange('booking', 'enableRefunds', e.target.checked)}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-gray-600">Разрешить пользователям оформлять возврат</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* UI Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Настройки интерфейса</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Основной цвет (HEX)</label>
                        <div className="flex items-center">
                            <input
                                type="color"
                                value={settings.ui.themeColor}
                                onChange={(e) => handleChange('ui', 'themeColor', e.target.value)}
                                className="w-10 h-10 p-1 border rounded mr-2"
                            />
                            <input
                                type="text"
                                value={settings.ui.themeColor}
                                onChange={(e) => handleChange('ui', 'themeColor', e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Элементов на странице</label>
                        <input
                            type="number"
                            value={settings.ui.itemsPerPage}
                            onChange={(e) => handleChange('ui', 'itemsPerPage', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Главная страница</label>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                checked={settings.ui.showNewsOnHome}
                                onChange={(e) => handleChange('ui', 'showNewsOnHome', e.target.checked)}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-gray-600">Показывать блок новостей на главной</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
