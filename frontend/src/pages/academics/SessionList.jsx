import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark, HiOutlineCheckCircle } from 'react-icons/hi2';

const demoSessions = [
  { id: 1, name: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31', is_active: true },
  { id: 2, name: '2024-2025', start_date: '2024-04-01', end_date: '2025-03-31', is_active: false },
  { id: 3, name: '2023-2024', start_date: '2023-04-01', end_date: '2024-03-31', is_active: false },
];

export default function SessionList() {
  const [sessions, setSessions] = useState(demoSessions);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '' });

  const openAdd = () => { setEditItem(null); setFormData({ name: '', start_date: '', end_date: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setFormData({ name: s.name, start_date: s.start_date, end_date: s.end_date }); setShowModal(true); };

  const handleSave = () => {
    if (!formData.name) { toast.error('Session name is required'); return; }
    if (editItem) {
      setSessions(sessions.map(s => s.id === editItem.id ? { ...s, ...formData } : s));
      toast.success('Session updated');
    } else {
      setSessions([...sessions, { id: Date.now(), ...formData, is_active: false }]);
      toast.success('Session added');
    }
    setShowModal(false);
  };

  const setActive = (id) => {
    setSessions(sessions.map(s => ({ ...s, is_active: s.id === id })));
    toast.success('Active session changed');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Academic Sessions</h1><p className="subtitle">Manage academic years</p></div>
        <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus size={18} /> Add Session</button>
      </div>

      <div className="grid-3">
        {sessions.map(s => (
          <div className={`card ${s.is_active ? '' : ''}`} key={s.id} style={s.is_active ? { border: '1px solid var(--primary-500)', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))' } : {}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h3">{s.name}</h3>
              {s.is_active && <span className="badge badge-success">Active</span>}
            </div>
            <p className="text-sm text-secondary mb-1">Start: {s.start_date}</p>
            <p className="text-sm text-secondary mb-4">End: {s.end_date}</p>
            <div className="flex gap-2">
              {!s.is_active && <button className="btn btn-sm btn-secondary" onClick={() => setActive(s.id)}><HiOutlineCheckCircle size={14} /> Set Active</button>}
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)}><HiOutlinePencil size={15} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => { setSessions(sessions.filter(x => x.id !== s.id)); toast.success('Deleted'); }}><HiOutlineTrash size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editItem ? 'Edit Session' : 'Add Session'}</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineXMark size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Session Name *</label><input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 2026-2027" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
