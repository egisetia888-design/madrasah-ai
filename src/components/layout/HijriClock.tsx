import React, { useState, useEffect } from 'react';
import { Clock, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HijriClock() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijriDate = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(time);

  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time);

  const currentTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <button 
      onClick={() => navigate('/analytics')}
      className="flex items-center gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:shadow transition-all group"
    >
      <div className="flex flex-col items-end text-right">
        <span className="text-xs font-semibold text-gray-900 tracking-tight text-right">{dayName}, {hijriDate}</span>
        <span className="text-[10px] text-gray-500 font-medium flex items-center justify-end gap-1">
          <Clock className="w-3 h-3" /> {currentTime} WIB
        </span>
      </div>
      <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100 transition-colors">
        <BarChart2 className="w-4 h-4" />
      </div>
    </button>
  );
}
