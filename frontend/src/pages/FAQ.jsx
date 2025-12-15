import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        const fetchFAQ = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/faq');
                setFaqData(response.data);
            } catch (error) {
                console.error('Error fetching FAQ:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQ();
    }, []);

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка вопросов...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <HelpCircle size={40} className="text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-primary mb-4">Частые вопросы</h1>
                    <p className="text-gray-600">
                        Мы собрали ответы на самые популярные вопросы наших слушателей. 
                        Если вы не нашли ответ на свой вопрос, свяжитесь с нами.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100"
                        >
                            <button
                                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                                onClick={() => toggleQuestion(index)}
                            >
                                <span className="font-semibold text-lg text-gray-800 pr-8">
                                    {item.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-primary flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="text-gray-400 flex-shrink-0" />
                                )}
                            </button>
                            
                            <div 
                                className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
                                    openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-primary/5 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Не нашли ответ?</h3>
                    <p className="text-gray-600 mb-6">
                        Наша служба поддержки готова помочь вам с любым вопросом.
                    </p>
                    <a 
                        href="/contacts" 
                        className="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/30"
                    >
                        Связаться с нами
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
