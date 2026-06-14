import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEntries, type DiaryEntry } from '../utils/db';

export default function CalendarView() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    getEntries().then(setEntries).catch(console.error);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map entries by day for the current month
  const entriesByDay: Record<number, string[]> = {};
  entries.forEach(entry => {
    const d = new Date(entry.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!entriesByDay[day]) entriesByDay[day] = [];
      entriesByDay[day].push(entry.mood);
    }
  });

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy': return '#facc15';
      case 'Sad': return '#60a5fa';
      case 'Calm': return '#34d399';
      case 'Stressed': return '#a855f7';
      default: return '#a855f7';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'Happy': return '😊';
      case 'Sad': return '😢';
      case 'Calm': return '😌';
      case 'Stressed': return '😰';
      default: return '😊';
    }
  };

  const renderGrid = () => {
    const grid = [];

    // Fill blank days before the 1st
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;
      const dayMoods = entriesByDay[i] || [];

      grid.push(
        <div 
          key={i} 
          className={`h-16 flex flex-col items-center justify-start pt-2 rounded-xl transition-all cursor-pointer hover:bg-[#1a1924] relative group
            ${isToday ? 'bg-[#2a1d45] border border-[#a855f7]/50' : 'bg-transparent'}`
          }
        >
          <span className={`text-sm font-medium ${isToday ? 'text-white font-bold' : 'text-gray-300'}`}>{i}</span>
          
          <div className="flex gap-1 mt-1.5">
            {dayMoods.slice(0, 3).map((mood, idx) => (
              <div 
                key={idx} 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: getMoodColor(mood), boxShadow: `0 0 5px ${getMoodColor(mood)}` }}
              ></div>
            ))}
            {dayMoods.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>}
          </div>
        </div>
      );
    }

    return grid;
  };

  return (
    <main className="p-6 md:p-10 max-w-2xl mx-auto w-full flex flex-col min-h-screen pt-24 md:pt-10">
      <div className="bg-[#111018] rounded-3xl border border-gray-800/50 p-6 md:p-8 flex-1 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-white">Calendar View</h2>
          <div className="w-8"></div> {/* Spacer for center alignment */}
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white transition-colors p-1">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-lg">{monthName} {year}</h3>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white transition-colors p-1">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-500 tracking-widest">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1">
          {renderGrid()}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between px-2">
          {['Happy', 'Sad', 'Calm', 'Stressed'].map(mood => (
            <div key={mood} className="flex items-center gap-2">
              <span className="text-lg leading-none">{getMoodEmoji(mood)}</span>
              <span className="text-xs font-medium text-gray-400">{mood}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
