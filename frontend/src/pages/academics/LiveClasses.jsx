import { useState } from 'react';
import { HiOutlineVideoCamera, HiOutlinePlus, HiOutlineCalendar, HiOutlineLink } from 'react-icons/hi2';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../hooks/useClasses';

const classes = [
  { id: 1, title: 'Algebra Equations', subject: 'Mathematics', class: 'Class 10', date: '2025-10-15', time: '10:00 AM - 11:00 AM', platform: 'Zoom', status: 'Live', teacher: 'Mr. Sharma' },
  { id: 2, title: 'Newton Laws', subject: 'Physics', class: 'Class 11', date: '2025-10-15', time: '11:30 AM - 12:30 PM', platform: 'Google Meet', status: 'Upcoming', teacher: 'Mrs. Verma' },
  { id: 3, title: 'World War II', subject: 'History', class: 'Class 9', date: '2025-10-16', time: '09:00 AM - 10:00 AM', platform: 'Zoom', status: 'Upcoming', teacher: 'Mr. Gupta' },
  { id: 4, title: 'Organic Chemistry', subject: 'Chemistry', class: 'Class 12', date: '2025-10-14', time: '14:00 PM - 15:00 PM', platform: 'Google Meet', status: 'Completed', teacher: 'Dr. Singh' },
];

export default function LiveClasses() {
  const { user } = useAuth();
  const classOptions = useClasses();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [classList, setClassList] = useState(classes);
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', subject: '', class: 'Class 10', date: '', time: '', platform: 'Google Meet', link: '' });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!newClass.title || !newClass.link) return;
    
    setClassList([{
      id: Date.now(),
      title: newClass.title,
      subject: newClass.subject,
      class: newClass.class,
      date: newClass.date,
      time: newClass.time,
      platform: newClass.platform,
      status: 'Upcoming',
      teacher: user?.name || 'Current Teacher'
    }, ...classList]);
    
    setShowForm(false);
    setNewClass({ title: '', subject: '', class: 'Class 10', date: '', time: '', platform: 'Google Meet', link: '' });
  };

  const filteredClasses = classList.filter(c => {
    if (activeTab === 'Upcoming') return c.status === 'Upcoming' || c.status === 'Live';
    return c.status === 'Completed';
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Live & Online Classes</h1>
          <p className="subtitle">Manage Zoom and Google Meet virtual classrooms</p>
        </div>
        {['super_admin', 'admin', 'teacher'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : 'Schedule Live Class'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Schedule New Live Class</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleSchedule}>
            <div className="form-group mb-0">
              <label>Class Topic</label>
              <input type="text" className="form-input" placeholder="e.g. Algebra Basics" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Subject</label>
              <input type="text" className="form-input" placeholder="e.g. Mathematics" value={newClass.subject} onChange={e => setNewClass({...newClass, subject: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Target Class</label>
              <select className="form-select" value={newClass.class} onChange={e => setNewClass({...newClass, class: e.target.value})}>
                <option value="">-- Select Class --</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Date</label>
              <input type="date" className="form-input" value={newClass.date} onChange={e => setNewClass({...newClass, date: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Time</label>
              <input type="text" className="form-input" placeholder="10:00 AM - 11:00 AM" value={newClass.time} onChange={e => setNewClass({...newClass, time: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Platform</label>
              <select className="form-select" value={newClass.platform} onChange={e => setNewClass({...newClass, platform: e.target.value})}>
                <option>Google Meet</option>
                <option>Zoom</option>
                <option>Teams</option>
              </select>
            </div>
            <div className="form-group mb-0 mt-4" style={{ gridColumn: 'span 2' }}>
              <label>GMeet / Meeting Link</label>
              <input type="url" className="form-input" placeholder="https://meet.google.com/xyz-abcd-efg" value={newClass.link} onChange={e => setNewClass({...newClass, link: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                Create Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-3 mb-6">
        <div className="stat-card stat-primary">
          <div className="stat-value">8</div>
          <div className="stat-label">Classes Today</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">1</div>
          <div className="stat-label">Currently Live</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">45</div>
          <div className="stat-label">Classes This Week</div>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <div className="tabs mb-0 border-b-0">
            <button className={`tab ${activeTab === 'Upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('Upcoming')}>Upcoming & Live</button>
            <button className={`tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>Completed</button>
          </div>
          <div className="table-search">
            <input type="text" placeholder="Search classes..." />
          </div>
        </div>
        
        <div className="table-container border-t-0 rounded-t-none">
          <table>
            <thead>
              <tr>
                <th>Class Topic</th>
                <th>Subject & Class</th>
                <th>Date & Time</th>
                <th>Platform</th>
                <th>Teacher</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map(cls => (
                <tr key={cls.id}>
                  <td className="font-semibold text-primary-400">{cls.title}</td>
                  <td>
                    <div>{cls.subject}</div>
                    <div className="text-xs text-secondary mt-1">{cls.class}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm"><HiOutlineCalendar /> {cls.date}</div>
                    <div className="text-xs text-secondary mt-1">{cls.time}</div>
                  </td>
                  <td>
                    <span className={`badge ${cls.platform === 'Zoom' ? 'badge-primary' : 'badge-success'}`}>
                      {cls.platform}
                    </span>
                  </td>
                  <td>{cls.teacher}</td>
                  <td>
                    <span className={`badge badge-${cls.status === 'Live' ? 'danger animate-pulse' : cls.status === 'Upcoming' ? 'warning' : 'secondary'}`}>
                      {cls.status}
                    </span>
                  </td>
                  <td>
                    {cls.status === 'Live' ? (
                      <button className="btn btn-sm btn-danger"><HiOutlineVideoCamera size={16} /> Join Class</button>
                    ) : cls.status === 'Upcoming' ? (
                      <button className="btn btn-sm btn-secondary" onClick={() => alert('GMeet Link: https://meet.google.com/xyz')}><HiOutlineLink size={16} /> Get Link</button>
                    ) : (
                      <span className="text-sm text-tertiary">Ended</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-secondary">
                    No classes found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
