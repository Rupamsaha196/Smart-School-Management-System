import React, { useState, useEffect } from 'react';
import {
  HiOutlineVideoCamera,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineLink,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineXMark
} from 'react-icons/hi2';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../hooks/useClasses';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function LiveClasses() {
  const { user } = useAuth();
  const classOptions = useClasses();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [newClass, setNewClass] = useState({
    title: '',
    subject: '',
    class_name: 'Class 10',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 11:00 AM',
    platform: 'Google Meet',
    link: ''
  });

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/live-classes');
      if (Array.isArray(data)) {
        setClassList(data);
      }
    } catch (err) {
      console.error('Failed to load live classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!newClass.title || !newClass.link) {
      toast.error('Title and meeting link are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...newClass,
        teacher_name: user?.name || 'Faculty Member',
        status: 'Upcoming'
      };
      const { data } = await api.post('/live-classes', payload);
      toast.success('Virtual live class scheduled successfully!');
      setClassList([data, ...classList]);
      setShowForm(false);
      setNewClass({
        title: '',
        subject: '',
        class_name: 'Class 10',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM - 11:00 AM',
        platform: 'Google Meet',
        link: ''
      });
    } catch (err) {
      console.error('Error scheduling live class:', err);
      toast.error('Failed to schedule class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete virtual class schedule "${title}"?`)) return;
    try {
      await api.delete(`/live-classes/${id}`);
      toast.success('Live class removed');
      setClassList(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      toast.error('Failed to delete live class');
    }
  };

  const filteredClasses = classList.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.class_name && c.class_name.toLowerCase().includes(q));

    const matchTab =
      activeTab === 'Upcoming'
        ? c.status === 'Upcoming' || c.status === 'Live'
        : c.status === 'Completed';

    return matchSearch && matchTab;
  });

  const liveCount = classList.filter(c => c.status === 'Live').length;
  const upcomingCount = classList.filter(c => c.status === 'Upcoming').length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Virtual Classrooms & Live Classes (Module 20)</h1>
          <p className="subtitle text-sm text-secondary">Manage Zoom, Google Meet and Teams live virtual class sessions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2" onClick={fetchLiveClasses} disabled={loading}>
            <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus size={18} />
            <span>{showForm ? 'Close Form' : 'Schedule Live Class'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header p-4 border-b border-secondary flex justify-between items-center">
            <span className="card-title font-bold text-base text-primary">Schedule New Live Online Class</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
              <HiOutlineXMark size={18} />
            </button>
          </div>
          <form className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSchedule}>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Class Topic *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Linear Equations in Two Variables"
                value={newClass.title}
                onChange={e => setNewClass({ ...newClass, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mathematics"
                value={newClass.subject}
                onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Target Class *</label>
              <select
                className="form-select"
                value={newClass.class_name}
                onChange={e => setNewClass({ ...newClass, class_name: e.target.value })}
              >
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Date *</label>
              <input
                type="date"
                className="form-input"
                value={newClass.date}
                onChange={e => setNewClass({ ...newClass, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Time *</label>
              <input
                type="text"
                className="form-input"
                placeholder="10:00 AM - 11:00 AM"
                value={newClass.time}
                onChange={e => setNewClass({ ...newClass, time: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Platform</label>
              <select
                className="form-select"
                value={newClass.platform}
                onChange={e => setNewClass({ ...newClass, platform: e.target.value })}
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
              </select>
            </div>
            <div className="form-group mb-0 md:col-span-2">
              <label className="form-label text-xs">Meeting Room URL / Link *</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://meet.google.com/xyz-abcd-efg or https://zoom.us/j/12345"
                value={newClass.link}
                onChange={e => setNewClass({ ...newClass, link: e.target.value })}
                required
              />
            </div>
            <div className="form-group flex items-end mb-0">
              <button type="submit" className="btn btn-success w-full font-semibold" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Create Live Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Active Classes Live Now</div>
          <div className="text-2xl font-bold text-danger-400 mt-1 flex items-center gap-2">
            {liveCount} {liveCount > 0 && <span className="inline-block w-2.5 h-2.5 rounded-full bg-danger-500 animate-ping"></span>}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Upcoming Virtual Classes</div>
          <div className="text-2xl font-bold text-primary mt-1">{upcomingCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Total Scheduled Records</div>
          <div className="text-2xl font-bold text-success-400 mt-1">{classList.length}</div>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar p-4 border-b border-secondary flex flex-wrap justify-between items-center gap-3">
          <div className="tabs mb-0 border-b-0 flex gap-2">
            <button
              className={`tab ${activeTab === 'Upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('Upcoming')}
            >
              Upcoming & Live ({classList.filter(c => c.status !== 'Completed').length})
            </button>
            <button
              className={`tab ${activeTab === 'Completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('Completed')}
            >
              Completed ({classList.filter(c => c.status === 'Completed').length})
            </button>
          </div>
          <div className="table-search" style={{ minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search live classes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class Topic</th>
                <th>Subject & Class</th>
                <th>Schedule Date & Time</th>
                <th>Platform</th>
                <th>Instructor</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-secondary">
                    <div className="inline-block animate-spin mr-2">⟳</div> Loading live classes...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-secondary">
                    No classes found for this category. Click "Schedule Live Class" above to add one.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => (
                  <tr key={cls.id}>
                    <td className="font-semibold text-primary-400">{cls.title}</td>
                    <td>
                      <div>{cls.subject}</div>
                      <div className="text-xs text-secondary">{cls.class_name || cls.class}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <HiOutlineCalendar size={14} className="text-primary" /> {cls.date}
                      </div>
                      <div className="text-xs text-secondary mt-0.5">{cls.time}</div>
                    </td>
                    <td>
                      <span className={`badge ${cls.platform === 'Zoom' ? 'badge-primary' : 'badge-success'}`}>
                        {cls.platform}
                      </span>
                    </td>
                    <td className="text-sm font-medium">{cls.teacher_name || cls.teacher}</td>
                    <td>
                      <span
                        className={`badge ${
                          cls.status === 'Live'
                            ? 'badge-danger animate-pulse'
                            : cls.status === 'Upcoming'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <a
                          href={cls.link}
                          target="_blank"
                          rel="noreferrer"
                          className={`btn btn-sm ${cls.status === 'Live' ? 'btn-danger' : 'btn-secondary'} flex items-center gap-1`}
                        >
                          {cls.status === 'Live' ? <HiOutlineVideoCamera size={16} /> : <HiOutlineLink size={16} />}
                          <span>{cls.status === 'Live' ? 'Join Now' : 'Join Link'}</span>
                        </a>
                        <button
                          className="btn btn-ghost btn-icon btn-sm text-danger-400"
                          onClick={() => handleDelete(cls.id, cls.title)}
                          title="Delete Schedule"
                        >
                          <HiOutlineTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
