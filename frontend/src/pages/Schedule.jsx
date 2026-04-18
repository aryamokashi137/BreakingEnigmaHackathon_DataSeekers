import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Schedule = () => {
  const tasks = [
    { time: '09:00 AM', title: 'Hearing: Smith vs Johnson', location: 'High Court, Room 4', type: 'hearing' },
    { time: '11:30 AM', title: 'Consultation: TechNova', location: 'Virtual Meeting', type: 'meeting' },
    { time: '02:00 PM', title: 'Document Drafting: Estate Miller', location: 'Office', type: 'drafting' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="schedule-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Court Schedule</h1>
          <p className="subtext">Manage your hearings, meetings, and legal deadlines.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </header>

      <div className="schedule-grid">
        <div className="calendar-section glass">
          <div className="calendar-header">
            <h2>April 2024</h2>
            <div className="calendar-nav">
              <button className="icon-button"><ChevronLeft size={18} /></button>
              <button className="icon-button"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="calendar-week-header">
            {days.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="calendar-days">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className={`calendar-day ${i + 1 === 18 ? 'today' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="daily-tasks glass">
          <div className="section-header">
            <h3>Today's Agenda</h3>
            <span className="text-muted">April 18, 2024</span>
          </div>
          <div className="tasks-timeline">
            {tasks.map((task, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`task-item ${task.type}`}
              >
                <div className="task-time">{task.time}</div>
                <div className="task-content">
                  <h4 className="task-title">{task.title}</h4>
                  <div className="task-meta">
                    <MapPin size={12} /> {task.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
