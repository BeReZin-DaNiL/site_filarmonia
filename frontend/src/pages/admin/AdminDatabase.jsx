import React, { useState, useEffect } from 'react';
import { getDatabaseDump } from '../../services/api';

const AdminDatabase = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDatabaseDump();
                setData(response.data);
            } catch (error) {
                console.error('Error fetching database dump:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Загрузка данных...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Ошибка загрузки данных</div>;
    }

    const tabs = Object.keys(data);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Просмотр базы данных</h1>
            <p className="text-gray-600">
                Здесь отображаются все данные, хранящиеся в оперативной памяти сервера (Mock Server).
            </p>

            {/* Tabs */}
            <div className="flex space-x-2 border-b overflow-x-auto pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                            activeTab === tab 
                                ? 'bg-white border-t border-l border-r border-gray-200 text-primary' 
                                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {Array.isArray(data[tab]) ? data[tab].length : Object.keys(data[tab]).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg capitalize">{activeTab}</h3>
                    <button 
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(data[activeTab], null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${activeTab}.json`;
                            a.click();
                        }}
                        className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                    >
                        Скачать JSON
                    </button>
                </div>
                <div className="p-0 overflow-auto max-h-[600px]">
                    <pre className="text-sm p-4 font-mono text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(data[activeTab], null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default AdminDatabase;
