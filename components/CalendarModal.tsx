import React from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar grid

  const events = [
    { date: 15, title: 'HackOnX Start', type: 'event', color: 'bg-primary' },
    { date: 17, title: 'HackOnX Submission', type: 'deadline', color: 'bg-red-500' },
    { date: 22, title: 'Results', type: 'info', color: 'bg-green-500' },
    { date: 10, title: 'Global AI Kickoff', type: 'event', color: 'bg-blue-500' },
  ];

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
             <h3 className="text-lg font-bold text-gray-900">March 2025</h3>
             <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronLeft size={16}/></button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronRight size={16}/></button>
             </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
             {/* Headers */}
             {days.map(d => (
                <div key={d} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase">
                  {d}
                </div>
             ))}
             
             {/* Days */}
             {dates.map((date, i) => {
                const dayEvents = events.filter(e => e.date === (i % 31) + 1); // Mock mapping
                const isCurrentMonth = i < 31;
                
                return (
                  <div key={i} className={`bg-white min-h-[100px] p-2 hover:bg-gray-50 transition-colors ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : ''}`}>
                      <span className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                        {isCurrentMonth ? (i % 31) + 1 : i - 30}
                      </span>
                      <div className="mt-2 space-y-1">
                        {isCurrentMonth && dayEvents.map((ev, idx) => (
                          <div key={idx} className={`text-[10px] text-white px-2 py-1 rounded truncate font-bold ${ev.color}`}>
                             {ev.title}
                          </div>
                        ))}
                      </div>
                  </div>
                )
             })}
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-6 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Deadline</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Hackathon Event</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Results</div>
        </div>
      </div>
    </div>
  );
};