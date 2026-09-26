import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineCalendar
} from 'react-icons/hi2';

export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '', is_active: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sessions');
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ name: '', start_date: '2026-04-01', end_date: '2027-03-31', is_active: false });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditItem(s);
    setFormData({
      name: s.name,
      start_date: s.start_date ? s.start_date.split('T')[0] : '',
      end_date: s.end_date ? s.end_date.split('T')[0] : '',
      is_active: Boolean(s.is_active)
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Session name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editItem) {
        await api.put(`/sessions/${editItem.id}`, formData);
        toast.success(`Academic session ${formData.name} updated!`);
      } else {
        await api.post('/sessions', formData);
        toast.success(`Academic session ${formData.name} created!`);
      }
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      console.error('Failed to save session:', err);
      toast.error(err.response?.data?.message || 'Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  const setActive = async (id) => {
    try {
      await api.post(`/sessions/${id}/activate`);
      toast.success('Active academic session updated!');
      fetchSessions();
    } catch (err) {
      console.error('Failed to activate session:', err);
      toast.error('Failed to update active session');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete session ${name}?`)) return;
    try {
      await api.delete(`/sessions/${id}`);
      toast.success('Session deleted successfully');
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Sessions (Module 40)</h1>
          <p className="subtitle text-sm text-secondary">Manage school academic years, term cycles, and the current active session</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-1.5" onClick={fetchSessions} disabled={loading}>
            <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary flex items-center gap-1.5" onClick={openAdd}>
            <HiOutlinePlus size={18} />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-secondary">
          <div className="inline-block animate-spin mr-2">⟳</div> Loading academic sessions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map(s => (
            <div
              className="card p-5 relative overflow-hidden transition-all duration-200"
              key={s.id}
              style={s.is_active ? {
                border: '1.5px solid var(--primary-500)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))'
              } : {}}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold">
                    <HiOutlineCalendar size={18} />
                  </div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                </div>
                {Boolean(s.is_active) ? (
                  <span className="badge badge-success font-semibold">Active Session</span>
                ) : (
                  <span className="badge badge-secondary">Archived</span>
                )}
              </div>

              <div className="space-y-1 text-xs text-secondary mb-5">
                <p>Start Date: <strong className="text-primary">{s.start_date}</strong></p>
                <p>End Date: <strong className="text-primary">{s.end_date}</strong></p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-secondary">
                {!Boolean(s.is_active) ? (
                  <button className="btn btn-xs btn-secondary flex items-center gap-1" onClick={() => setActive(s.id)}>
                    <HiOutlineCheckCircle size={14} /> Set as Active
                  </button>
                ) : (
                  <span className="text-xs text-success-400 font-medium">● Current System Session</span>
                )}
                <div className="flex gap-1 ml-auto">
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} title="Edit">
                    <HiOutlinePencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm text-danger-400"
                    onClick={() => handleDelete(s.id, s.name)}
                    title="Delete"
                  >
                    <HiOutlineTrash size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="text-lg font-bold">{editItem ? 'Edit Session' : 'Add New Academic Session'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} disabled={submitting}>
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-4">
                <div className="form-group mb-0">
                  <label className="form-label">Session Name *</label>
                  <input
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 2026-2027"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label">Start Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">End Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editItem ? 'Update Session' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
