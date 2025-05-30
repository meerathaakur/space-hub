import { useState } from 'react';
import { FiCalendar, FiPlus, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const daysInMonth = 30; // For demo
const events = [
  { id: 1, date: 5, title: 'Team Meeting', time: '10:00 AM' },
  { id: 2, date: 12, title: 'Design Review', time: '2:00 PM' },
  { id: 3, date: 18, title: 'Project Deadline', time: 'All Day' },
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="p-4 mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiCalendar className="text-pink-500" /> Calendar
        </h1>
        <div className="flex gap-2">
          <button
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition text-sm"
            onClick={() => setSelectedDate(null)}
          >
            All Events
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition text-sm">
            <FiPlus /> <span>Add Event</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const hasEvent = events.some((e) => e.date === day);
            return (
              <button
                key={day}
                className={`h-12 w-full rounded-lg flex flex-col items-center justify-center border transition ${selectedDate === day ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'} ${hasEvent ? 'font-bold text-blue-600' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <span>{day}</span>
                {hasEvent && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Event List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Events</h2>
        <ul className="divide-y divide-gray-100">
          {events
            .filter((e) => !selectedDate || e.date === selectedDate)
            .map((event) => (
              <li key={event.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-gray-400">{`Day ${event.date}, ${event.time}`}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-pink-100 text-pink-700">Event</span>
              </li>
            ))}
          {events.filter((e) => !selectedDate || e.date === selectedDate).length === 0 && (
            <li className="py-3 text-gray-400">No events for this day.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Calendar; 