import { useState, useEffect } from 'react';
import { HiOutlineCalendarDays, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function AnnualCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Event' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/calendar-events');
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    try {
      if (editingId) {
        const { data } = await api.put(`/calendar-events/${editingId}`, newEvent);
        setEvents(events.map(ev => ev.id === editingId ? data : ev).sort((a, b) => new Date(a.date) - new Date(b.date)));
        toast.success('Event updated');
      } else {
        const { data } = await api.post('/calendar-events', newEvent);
        setEvents([...events, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
        toast.success('Event added to calendar');
      }
      setShowForm(false);
      setEditingId(null);
      setNewEvent({ title: '', date: '', type: 'Event' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (ev) => {
    setNewEvent({ title: ev.title, date: ev.date, type: ev.type });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar-events/${id}`);
      setEvents(events.filter(ev => ev.id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Annual Calendar</h1>
          <p className="subtitle">Manage academic calendar, holidays, and school events</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setNewEvent({ title: '', date: '', type: 'Event' }); }}>
          <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add Event / Holiday'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">{editingId ? 'Edit Calendar Event' : 'Add New Calendar Event'}</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddEvent}>
            <div className="form-group mb-0">
              <label>Event Title</label>
              <input type="text" className="form-input" placeholder="e.g. Diwali Holiday" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Event Date</label>
              <input type="date" className="form-input" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Event Type</label>
              <select className="form-select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                <option>Academic</option>
                <option>Event</option>
                <option>Holiday</option>
              </select>
            </div>
            <div className="form-group flex items-end mb-0 mt-4" style={{ gridColumn: 'span 3', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">{editingId ? 'Update Event' : 'Save Event'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineCalendarDays/> Upcoming Events</span>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center"><span className="spinner"></span></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event Title</th>
                  <th>Event Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-secondary p-4">No calendar events found</td></tr>
                ) : events.map(ev => (
                  <tr key={ev.id}>
                    <td className="font-semibold">{ev.date}</td>
                    <td>{ev.title}</td>
                    <td>
                      <span className={`badge ${ev.type === 'Holiday' ? 'badge-danger' : ev.type === 'Academic' ? 'badge-info' : 'badge-success'}`}>
                        {ev.type}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      <button className="btn btn-sm btn-ghost text-primary-400" onClick={() => handleEdit(ev)}>Edit</button>
                      <button className="btn btn-sm btn-ghost text-danger-400" onClick={() => handleDelete(ev.id)}><HiOutlineTrash size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
