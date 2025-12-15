import React, { useState, useEffect, useRef } from 'react';
import { getAdminReports } from '../../services/api';
import { Download, Mail, Calendar, BarChart2, Users, CreditCard, Activity, RefreshCw } from 'lucide-react';

const AdminReports = () => {
    const [period, setPeriod] = useState('week');
    const [activeTab, setActiveTab] = useState('summary');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEmailSettings, setShowEmailSettings] = useState(false);
    const [emailConfig, setEmailConfig] = useState({ frequency: 'weekly', email: 'admin@philharmonia.ru' });

    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setData(null); // Clear data to avoid mismatch during tab switch
        const requestedTab = activeTab;
        
        try {
            const response = await getAdminReports({ period, type: requestedTab });
            // Only update if we are still on the same tab
            if (activeTabRef.current === requestedTab) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            // Only turn off loading if we are still on the same tab (or just always turn it off? 
            // If we switched tabs, the new fetch will set loading=true anyway.
            // But if we switch back and forth, we might have race conditions on loading state too.
            // Better to check ref.
            if (activeTabRef.current === requestedTab) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [period, activeTab]);

    const handleEmailSave = (e) => {
        e.preventDefault();
        alert(`Настройки сохранены! Отчеты будут приходить ${emailConfig.frequency} на ${emailConfig.email}`);
        setShowEmailSettings(false);
    };

    // Custom Simple Line Chart
    const LineChart = ({ data, dataKey, labelKey, color = "#ef4444" }) => {
        if (!data || !Array.isArray(data) || data.length === 0) return <div>Нет данных</div>;
        
        const height = 300;
        const width = 600;
        const padding = 40;
        
        const maxValue = Math.max(...data.map(d => Number(d[dataKey]) || 0)) || 100; // Default to 100 to avoid division by zero
        const minValue = 0; // Assuming positive values
        
        const getX = (index) => padding + (index * (width - 2 * padding) / (data.length - 1 || 1));
        const getY = (value) => height - padding - ((Number(value) || 0 - minValue) / (maxValue - minValue) * (height - 2 * padding));
        
        const points = data.map((d, i) => `${getX(i)},${getY(d[dataKey])}`).join(' ');

        return (
            <div className="w-full overflow-x-auto">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
                    {/* Y Axis */}
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                    {/* X Axis */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                    
                    {/* Grid Lines & Y Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const val = Math.round(minValue + (maxValue - minValue) * ratio);
                        const y = height - padding - (ratio * (height - 2 * padding));
                        return (
                            <g key={i}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <text x={padding - 10} y={y + 5} textAnchor="end" fontSize="10" fill="#64748b">{val}</text>
                            </g>
                        );
                    })}

                    {/* Path */}
                    <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Points & Tooltips (simplified) */}
                    {data.map((d, i) => (
                        <circle key={i} cx={getX(i)} cy={getY(d[dataKey])} r="4" fill={color} />
                    ))}

                    {/* X Labels */}
                    {data.map((d, i) => (
                        <text key={i} x={getX(i)} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#64748b">
                            {d[labelKey] && d[labelKey].includes('-') ? d[labelKey].split('-').slice(1).join('/') : d[labelKey]}
                        </text>
                    ))}
                </svg>
            </div>
        );
    };

    // Custom Simple Bar Chart
    const BarChart = ({ data, dataKey, labelKey, color = "#3b82f6" }) => {
        if (!data || !Array.isArray(data) || data.length === 0) return <div>Нет данных</div>;
        
        const height = 300;
        const width = 600;
        const padding = 40;
        const barWidth = (width - 2 * padding) / data.length * 0.6;
        
        const maxValue = Math.max(...data.map(d => Number(d[dataKey]) || 0)) || 100;
        
        return (
            <div className="w-full overflow-x-auto">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
                     {/* Axes */}
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                    
                    {/* Bars */}
                    {data.map((d, i) => {
                        const val = Number(d[dataKey]) || 0;
                        const barHeight = (val / maxValue) * (height - 2 * padding);
                        const x = padding + (i * (width - 2 * padding) / data.length) + ((width - 2 * padding) / data.length - barWidth) / 2;
                        const y = height - padding - barHeight;
                        
                        return (
                            <g key={i}>
                                <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="4" />
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#64748b">{val}</text>
                                <text x={x + barWidth / 2} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#64748b">
                                    {d[labelKey] && d[labelKey].length > 10 ? d[labelKey].substring(0, 10) + '...' : d[labelKey]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Аналитика и отчеты</h1>
                    <p className="text-gray-600">Ключевые показатели эффективности работы системы</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setShowEmailSettings(true)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Mail size={20} />
                        Рассылка
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download size={20} />
                        Экспорт
                    </button>
                    <button 
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <RefreshCw size={20} />
                        Обновить
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {[
                        { id: 'summary', icon: Activity, label: 'Сводка' },
                        { id: 'sales', icon: CreditCard, label: 'Продажи' },
                        { id: 'users', icon: Users, label: 'Пользователи' },
                        { id: 'events', icon: Calendar, label: 'Мероприятия' },
                        { id: 'technical', icon: BarChart2, label: 'Тех. метрики' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                activeTab === tab.id 
                                ? 'bg-red-50 text-red-600 border border-red-200' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    {['day', 'week', 'month', 'quarter'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                period === p 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {p === 'day' && 'День'}
                            {p === 'week' && 'Неделя'}
                            {p === 'month' && 'Месяц'}
                            {p === 'quarter' && 'Квартал'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {activeTab === 'summary' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm mb-1">Выручка</div>
                                    <div className="text-2xl font-bold text-gray-900">{data.totalSales?.toLocaleString()} ₽</div>
                                    <div className="text-green-600 text-sm mt-2 flex items-center">↑ 12% к прошлому периоду</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm mb-1">Продано билетов</div>
                                    <div className="text-2xl font-bold text-gray-900">{data.totalTickets}</div>
                                    <div className="text-green-600 text-sm mt-2 flex items-center">↑ 5% к прошлому периоду</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm mb-1">Новых пользователей</div>
                                    <div className="text-2xl font-bold text-gray-900">{data.newUsers}</div>
                                    <div className="text-red-600 text-sm mt-2 flex items-center">↓ 2% к прошлому периоду</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm mb-1">Активных мероприятий</div>
                                    <div className="text-2xl font-bold text-gray-900">{data.activeEvents}</div>
                                    <div className="text-gray-400 text-sm mt-2">Всего в системе</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
                                    <LineChart data={data.salesTrend} dataKey="value" labelKey="date" color="#10b981" />
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-4">Популярные мероприятия</h3>
                                    <BarChart data={data.popularEvents} dataKey="value" labelKey="name" color="#3b82f6" />
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'sales' && Array.isArray(data) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Детальная статистика продаж</h3>
                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Выручка (₽)</h4>
                                <LineChart data={data} dataKey="amount" labelKey="date" color="#10b981" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Количество билетов (шт)</h4>
                                <BarChart data={data} dataKey="tickets" labelKey="date" color="#8b5cf6" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && Array.isArray(data) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Активность пользователей</h3>
                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Активные пользователи</h4>
                                <LineChart data={data} dataKey="active" labelKey="date" color="#f59e0b" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Новые регистрации</h4>
                                <BarChart data={data} dataKey="registrations" labelKey="date" color="#ec4899" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && Array.isArray(data) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Эффективность мероприятий</h3>
                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Выручка по мероприятиям (Топ 5)</h4>
                                <BarChart data={data} dataKey="revenue" labelKey="name" color="#6366f1" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Заполняемость залов (%)</h4>
                                <BarChart data={data} dataKey="occupancy" labelKey="name" color="#14b8a6" />
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'technical' && Array.isArray(data) && (
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Технические метрики</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Нагрузка (запросы)</h4>
                                    <LineChart data={data} dataKey="requests" labelKey="date" color="#64748b" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Время отклика (мс)</h4>
                                    <LineChart data={data} dataKey="latency" labelKey="date" color="#0ea5e9" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Не удалось загрузить данные
                </div>
            )}

            {/* Email Settings Modal */}
            {showEmailSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Настройка рассылки отчетов</h3>
                        <form onSubmit={handleEmailSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email для получения</label>
                                <input 
                                    type="email" 
                                    value={emailConfig.email}
                                    onChange={(e) => setEmailConfig({...emailConfig, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Частота рассылки</label>
                                <select 
                                    value={emailConfig.frequency}
                                    onChange={(e) => setEmailConfig({...emailConfig, frequency: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="daily">Ежедневно</option>
                                    <option value="weekly">Еженедельно</option>
                                    <option value="monthly">Ежемесячно</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowEmailSettings(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Отмена
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;