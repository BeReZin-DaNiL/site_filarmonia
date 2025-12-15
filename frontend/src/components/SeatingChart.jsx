import React, { useEffect, useState } from 'react';
import { getEventSeats } from '../services/api';

const SeatingChart = ({ eventId, selectedSeats, onSelectSeat }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSeats = async () => {
            try {
                const res = await getEventSeats(eventId);
                setSeats(res.data);
            } catch (error) {
                console.error("Failed to load seats", error);
            } finally {
                setLoading(false);
            }
        };
        loadSeats();
    }, [eventId]);

    if (loading) return <div className="text-center py-4">Загрузка схемы зала...</div>;

    // Group seats by row for easier rendering
    const rows = [...new Set(seats.map(s => s.row))];

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] p-4 bg-gray-100 rounded-lg">
                <div className="w-full bg-gray-300 text-gray-600 text-center py-2 mb-8 rounded-t-lg shadow-inner text-sm uppercase tracking-widest">
                    Сцена
                </div>

                <div className="space-y-2">
                    {rows.map(rowNum => (
                        <div key={rowNum} className="flex justify-center items-center gap-2">
                            <span className="w-8 text-right text-xs text-gray-500 font-mono">{rowNum}</span>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === rowNum).sort((a,b) => a.number - b.number).map(seat => {
                                    const isSelected = selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
                                    const isOccupied = seat.isOccupied;
                                    
                                    let colorClass = 'bg-green-500 hover:bg-green-600';
                                    if (seat.category === 'VIP') colorClass = 'bg-purple-500 hover:bg-purple-600';
                                    if (seat.category === 'Premium') colorClass = 'bg-blue-500 hover:bg-blue-600';
                                    
                                    if (isOccupied) colorClass = 'bg-gray-400 cursor-not-allowed';
                                    if (isSelected) colorClass = 'bg-yellow-400 ring-2 ring-yellow-600 shadow-md transform scale-110 z-10';

                                    return (
                                        <button
                                            key={`${seat.row}-${seat.number}`}
                                            disabled={isOccupied}
                                            onClick={() => onSelectSeat(seat)}
                                            title={`Ряд ${seat.row}, Место ${seat.number} (${seat.price}₽)`}
                                            className={`w-6 h-6 rounded-t-lg text-[10px] text-white flex items-center justify-center transition-all ${colorClass}`}
                                        >
                                            {seat.number}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="w-8 text-left text-xs text-gray-500 font-mono">{rowNum}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400 rounded-sm"></div> Занято</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-sm"></div> Выбрано</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-500 rounded-sm"></div> VIP (3000₽)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-sm"></div> Premium (2000₽)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div> Standard (1000₽)</div>
                </div>
            </div>
        </div>
    );
};

export default SeatingChart;