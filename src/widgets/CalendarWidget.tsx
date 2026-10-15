import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, CheckSquare, Square } from 'lucide-react';

interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  completed: boolean;
  color: string; // hex color
  reminder: boolean;
}

export const CalendarWidget: React.FC = () => {
  const [activeView, setActiveView] = useState<'schedule' | 'month' | 'year'>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [events, setEvents] = useState<PlannerEvent[]>(() => {
    try {
      const saved = localStorage.getItem('pisland-planner-events');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default fallback events matching previous version
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { id: '1', title: 'Project Meeting', date: todayStr, time: '09:00', completed: false, color: '#ef4444', reminder: true },
      { id: '2', title: 'Lunch', date: todayStr, time: '13:00', completed: false, color: '#10b981', reminder: false },
      { id: '3', title: 'Gym', date: todayStr, time: '17:00', completed: true, color: '#3b82f6', reminder: false }
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTime, setFormTime] = useState('12:00');
  const [formColor, setFormColor] = useState('#F2F2F2');
  const [formReminder, setFormReminder] = useState(false);

  useEffect(() => {
    localStorage.setItem('pisland-planner-events', JSON.stringify(events));
  }, [events]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = events
    .filter(ev => ev.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleToggleComplete = (id: string) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev));
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const openAddForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormTime('12:00');
    setFormColor('#F2F2F2');
    setFormReminder(false);
    setEditingEvent(null);
    setShowAddForm(true);
  };

  const openEditForm = (ev: PlannerEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormDesc(ev.description || '');
    setFormTime(ev.time);
    setFormColor(ev.color);
    setFormReminder(ev.reminder);
    setShowAddForm(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? {
        ...ev,
        title: formTitle,
        description: formDesc,
        time: formTime,
        color: formColor,
        reminder: formReminder
      } : ev));
    } else {
      const newEv: PlannerEvent = {
        id: Math.random().toString(),
        title: formTitle,
        description: formDesc,
        date: selectedDateStr,
        time: formTime,
        completed: false,
        color: formColor,
        reminder: formReminder
      };
      setEvents([...events, newEv]);
    }
    setShowAddForm(false);
  };

  // Helper values for Month calculations
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const cells: React.ReactNode[] = [];
    
    // Empty cells padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    // Days grid
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const hasEvents = events.some(ev => ev.date === dateStr);
      
      const isToday = 
        day === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear();
      
      const isSelected = 
        day === selectedDate.getDate() && 
        month === selectedDate.getMonth() && 
        year === selectedDate.getFullYear();

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => {
            setSelectedDate(dateObj);
            setActiveView('schedule');
          }}
          className={`
            h-7 w-7 rounded-xl flex flex-col items-center justify-center relative cursor-pointer text-[10px] font-semibold transition-all
            ${isSelected ? 'bg-white text-black font-extrabold shadow-md' : 'text-neutral-300 hover:bg-white/10'}
            ${isToday && !isSelected ? 'border border-accent' : ''}
          `}
        >
          <span>{day}</span>
          {hasEvents && (
            <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-accent'}`} />
          )}
        </button>
      );
    }

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white font-sans">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer">
              <ChevronLeft size={11} />
            </button>
            <button onClick={handleNextMonth} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer">
              <ChevronRight size={11} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-neutral-500 font-bold mb-1">
          {weekdays.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>
    );
  };

  const renderYearGrid = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return (
      <div className="grid grid-cols-3 gap-2">
        {months.map((m, idx) => {
          const isCurrentMonth = idx === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
          return (
            <button
              key={m}
              onClick={() => {
                setCurrentMonth(new Date(currentMonth.getFullYear(), idx, 1));
                setActiveView('month');
              }}
              className={`
                py-2.5 rounded-2xl border text-center transition-all cursor-pointer font-sans
                ${isCurrentMonth 
                  ? 'bg-accent/10 border-accent text-accent font-bold' 
                  : 'bg-black/15 border-white/[0.03] hover:bg-black/25 text-neutral-300 hover:text-white'
                }
              `}
            >
              <span className="text-[11px] uppercase tracking-wider">{m}</span>
              <span className="text-[8px] block opacity-50 mt-0.5">{currentMonth.getFullYear()}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3.5 p-1 select-none font-sans max-h-[350px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">Schedule & Calendar</h3>
        
        {/* View Switcher segment button */}
        <div className="flex bg-black/30 border border-white/5 rounded-xl p-0.5">
          {(['schedule', 'month', 'year'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`
                px-2.5 py-1 text-[9px] font-semibold rounded-lg capitalize transition-all cursor-pointer
                ${activeView === view 
                  ? 'bg-white text-black font-extrabold shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px] pr-0.5 relative">
        
        {/* ADD / EDIT FORM OVERLAY */}
        {showAddForm && (
          <form onSubmit={handleSaveEvent} className="flex flex-col gap-3 bg-black/90 border border-white/10 rounded-2xl p-3.5 absolute inset-0 z-50 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-neutral-500 hover:text-white">
                <X size={12} />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Event title..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="bg-white/[0.03] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/15"
              autoFocus
              required
            />
            
            <div className="flex gap-2">
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
              {/* Color picker shortcuts */}
              <div className="flex items-center gap-1.5 px-2 bg-white/[0.03] border border-white/5 rounded-xl">
                {['#F2F2F2', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className="w-3.5 h-3.5 rounded-full border border-black/30 transition-transform hover:scale-125"
                    style={{ backgroundColor: c, transform: formColor === c ? 'scale(1.2)' : 'none' }}
                  />
                ))}
              </div>
            </div>

            <textarea
              placeholder="Description (optional)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="bg-white/[0.03] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/15 h-12 resize-none"
            />

            <label className="flex items-center gap-2 text-[10px] text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formReminder}
                onChange={(e) => setFormReminder(e.target.checked)}
                className="rounded border-white/10 bg-black/40 text-accent focus:ring-0"
              />
              <span>Set Notification Reminder</span>
            </label>

            <button
              type="submit"
              className="w-full py-1.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer transition-all"
            >
              Save Event
            </button>
          </form>
        )}

        {/* 1. SCHEDULE VIEW */}
        {activeView === 'schedule' && (
          <div className="flex flex-col gap-3">
            {/* Header Selected Date Card */}
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center h-10 w-10 bg-accent/10 rounded-xl border border-accent/20">
                  <span className="text-[8px] text-accent font-bold uppercase tracking-wider leading-none">
                    {selectedDate.toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-base font-extrabold text-white font-mono leading-none mt-0.5">
                    {selectedDate.getDate()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{selectedDate.toLocaleDateString('default', { weekday: 'long' })}</span>
                  <span className="text-[9px] text-neutral-500 mt-0.5">{selectedDate.toLocaleDateString('default', { dateStyle: 'medium' })}</span>
                </div>
              </div>
              
              <button
                onClick={openAddForm}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5 transition-all flex items-center justify-center"
                title="Add New Event"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Daily Events List */}
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider px-1">Schedules</div>
              {dayEvents.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-white/[0.01] border border-white/[0.02]">
                  <CalendarIcon size={16} className="text-neutral-600 mx-auto mb-1.5" />
                  <span className="text-[10px] text-neutral-500">No events scheduled.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] transition-all hover:bg-white/[0.03] border-l-[3px]`}
                      style={{ borderLeftColor: ev.color }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button 
                          onClick={() => handleToggleComplete(ev.id)}
                          className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {ev.completed ? (
                            <CheckSquare size={13} className="text-accent" />
                          ) : (
                            <Square size={13} />
                          )}
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className={`text-[11px] font-bold truncate ${ev.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                            {ev.title}
                          </span>
                          {ev.description && (
                            <span className="text-[9px] text-neutral-500 mt-0.5 truncate">{ev.description}</span>
                          )}
                          <span className="text-[8px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1">
                            <Clock size={8} /> {ev.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={() => openEditForm(ev)} className="p-1 text-neutral-500 hover:text-white cursor-pointer transition-colors">
                          <Plus size={10} className="rotate-45" /> {/* Use X or Plus as edit */}
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer transition-colors">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MONTH VIEW */}
        {activeView === 'month' && renderMonthGrid()}

        {/* 3. YEAR VIEW */}
        {activeView === 'year' && renderYearGrid()}

      </div>
    </div>
  );
};
