import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

interface CalendarEvent {
  date: Date;
  title: string;
  type: string;
  color: string;
  hackathonId?: string;
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: CalendarEvent[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, events = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Next month days to fill the grid (ensure 35 days for 5 rows)
    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  }, [currentMonth]);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const getEventsForDay = (day: { date: number; isCurrentMonth: boolean; fullDate: Date }) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === day.date &&
        eventDate.getMonth() === day.fullDate.getMonth() &&
        eventDate.getFullYear() === day.fullDate.getFullYear();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <CalIcon size={20} />
             </div>
             <div>
                <h2 className="text-xl font-heading text-gray-900">Schedule</h2>
                <p className="text-xs text-gray-500">Deadlines & Events</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-900">{formatMonthYear(currentMonth)}</h3>
             <div className="flex gap-2">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16}/>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
             {/* Headers */}
             {days.map((d, idx) => (
                <div key={idx} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase">
                  {d}
                </div>
             ))}
             
             {/* Days */}
             {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const today = new Date();
                const isToday = day.isCurrentMonth && 
                  day.date === today.getDate() && 
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear();
                
                return (
                  <div 
                    key={i} 
                    className={`bg-white min-h-[100px] p-2 hover:bg-gray-50 transition-colors ${!day.isCurrentMonth ? 'bg-gray-50/50' : ''}`}
                  >
                      <span className={`text-sm font-medium ${
                        !day.isCurrentMonth ? 'text-gray-300' : 
                        isToday ? 'bg-primary text-white px-2 py-0.5 rounded-full' : 
                        'text-gray-700'
                      }`}>
                        {day.date}
                      </span>
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map((ev, idx) => (
                          <div key={idx} className={`text-[10px] text-white px-2 py-1 rounded truncate font-bold ${ev.color}`}>
                             {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-gray-500 font-medium px-2">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                  </div>
                )
             })}
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-6 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Deadline</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Hackathon Start</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Results</div>
        </div>
      </div>
    </div>
  );
};