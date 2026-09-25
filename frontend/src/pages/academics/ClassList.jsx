import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark } from 'react-icons/hi2';

const demoClasses = [
  { id: 1, name: 'Nursery', sections: ['A', 'B'], students: 45 },
  { id: 2, name: 'LKG', sections: ['A', 'B'], students: 52 },
  { id: 3, name: 'UKG', sections: ['A', 'B', 'C'], students: 68 },
  { id: 4, name: 'Class 1', sections: ['A', 'B', 'C'], students: 72 },
  { id: 5, name: 'Class 2', sections: ['A', 'B'], students: 58 },
  { id: 6, name: 'Class 3', sections: ['A', 'B', 'C'], students: 74 },
  { id: 7, name: 'Class 4', sections: ['A', 'B'], students: 56 },
  { id: 8, name: 'Class 5', sections: ['A', 'B', 'C'], students: 78 },
  { id: 9, name: 'Class 6', sections: ['A', 'B'], students: 64 },
  { id: 10, name: 'Class 7', sections: ['A', 'B'], students: 60 },
  { id: 11, name: 'Class 8', sections: ['A', 'B', 'C'], students: 82 },
  { id: 12, name: 'Class 9', sections: ['A', 'B'], students: 66 },
  { id: 13, name: 'Class 10', sections: ['A', 'B'], students: 70 },
  { id: 14, name: 'Class 11', sections: ['Science', 'Commerce'], students: 48 },
  { id: 15, name: 'Class 12', sections: ['Science', 'Commerce'], students: 44 },
];

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', sections: '' });

  React.useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      // Format data: the DB stores sections as a comma-separated string, the frontend expects an array.
      // E.g., 'A, B' -> ['A', 'B']
      const formatted = data.map(c => ({
        ...c,
        sections: c.sections ? c.sections.split(',').map(s => s.trim()) : [],
        students: 0 // We don't have this in generic DB yet
      }));
      setClasses(formatted);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  const openAdd = () => { setEditItem(null); setFormData({ name: '', sections: '' }); setShowModal(true); };
  const openEdit = (cls) => { setEditItem(cls); setFormData({ name: cls.name, sections: cls.sections.join(', ') }); setShowModal(true); };

  const handleSave = () => {
    if (!formData.name) { toast.error('Class name is required'); return; }
    if (editItem) {
      setClasses(classes.map(c => c.id === editItem.id ? { ...c, name: formData.name, sections: formData.sections.split(',').map(s => s.trim()).filter(Boolean) } : c));
      toast.success('Class updated');
    } else {
      const newClass = { id: Date.now(), name: formData.name, sections: formData.sections.split(',').map(s => s.trim()).filter(Boolean), students: 0 };
      setClasses([...classes, newClass]);
      toast.success('Class added');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setClasses(classes.filter(c => c.id !== id));
    toast.success('Class deleted');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Classes & Sections</h1>
          <p className="subtitle">Manage school classes and their sections</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus size={18} /> Add Class</button>
      </div>

      <div className="grid-3">
        {classes.map((cls) => (
          <div className="card" key={cls.id} style={{ cursor: 'default' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-h4">{cls.name}</h3>
              <div className="flex gap-1">
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(cls)}><HiOutlinePencil size={15} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(cls.id)} style={{ color: 'var(--danger-400)' }}><HiOutlineTrash size={15} /></button>
              </div>
            </div>
            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              {cls.sections.map(sec => (
                <span key={sec} className="badge badge-primary">{sec}</span>
              ))}
            </div>
            <p className="text-sm text-secondary">{cls.students} students enrolled</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit Class' : 'Add New Class'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineXMark size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Class 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Sections (comma separated)</label>
                <input className="form-input" value={formData.sections} onChange={e => setFormData({...formData, sections: e.target.value})} placeholder="e.g. A, B, C" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Add Class'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
