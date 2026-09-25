import { useState } from 'react';
import { HiOutlineClock, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useClasses } from '../../hooks/useClasses';

export default function ClassTimetable() {
  const classOptions = useClasses();
  const [selectedClass, setSelectedClass] = useState('');

  const timetable = [
    { time: '08:00 AM - 08:45 AM', mon: 'Mathematics', tue: 'Science', wed: 'English', thu: 'History', fri: 'Physical Ed' },
    { time: '08:45 AM - 09:30 AM', mon: 'Science', tue: 'Mathematics', wed: 'History', thu: 'English', fri: 'Art' },
    { time: '09:30 AM - 09:45 AM', mon: 'BREAK', tue: 'BREAK', wed: 'BREAK', thu: 'BREAK', fri: 'BREAK' },
    { time: '09:45 AM - 10:30 AM', mon: 'English', tue: 'History', wed: 'Science', thu: 'Mathematics', fri: 'Computer' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Class Timetable</h1>
          <p className="subtitle">Manage and view schedules for classes and teachers</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4 items-end">
          <div className="form-group mb-0" style={{ flex: 1 }}>
            <label className="form-label">Select Class</label>
            <select className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">-- Select Class --</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary"><HiOutlineMagnifyingGlass size={18} /> Search Timetable</button>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="card-header">
          <span className="card-title flex items-center gap-2"><HiOutlineClock /> Timetable for {selectedClass}</span>
          <button className="btn btn-ghost btn-sm text-primary-400">Edit Schedule</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-secondary">{row.time}</td>
                  {['mon', 'tue', 'wed', 'thu', 'fri'].map(day => (
                    <td key={day}>
                      {row[day] === 'BREAK' ? (
                        <span className="badge badge-warning">BREAK</span>
                      ) : (
                        <span className="text-sm">{row[day]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
