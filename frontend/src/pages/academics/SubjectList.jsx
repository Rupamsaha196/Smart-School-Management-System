import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const demoSubjects = [
  { id: 1, name: 'Mathematics', code: 'MATH', type: 'Theory', class_name: 'All Classes' },
  { id: 2, name: 'Science', code: 'SCI', type: 'Theory + Practical', class_name: 'All Classes' },
  { id: 3, name: 'English', code: 'ENG', type: 'Theory', class_name: 'All Classes' },
  { id: 4, name: 'Hindi', code: 'HIN', type: 'Theory', class_name: 'All Classes' },
  { id: 5, name: 'Social Studies', code: 'SST', type: 'Theory', class_name: 'All Classes' },
  { id: 6, name: 'Computer Science', code: 'CS', type: 'Theory + Practical', class_name: 'Class 6-12' },
  { id: 7, name: 'Physical Education', code: 'PE', type: 'Practical', class_name: 'All Classes' },
  { id: 8, name: 'Art & Craft', code: 'ART', type: 'Practical', class_name: 'Nursery-Class 5' },
  { id: 9, name: 'Physics', code: 'PHY', type: 'Theory + Practical', class_name: 'Class 11-12' },
  { id: 10, name: 'Chemistry', code: 'CHEM', type: 'Theory + Practical', class_name: 'Class 11-12' },
  { id: 11, name: 'Biology', code: 'BIO', type: 'Theory + Practical', class_name: 'Class 11-12' },
  { id: 12, name: 'Accountancy', code: 'ACC', type: 'Theory', class_name: 'Class 11-12' },
];

export default function SubjectList() {
  const [subjects, setSubjects] = useState(demoSubjects);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', type: 'Theory', class_name: '' });

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setEditItem(null); setFormData({ name: '', code: '', type: 'Theory', class_name: '' }); setShowModal(true); };
  const openEdit = (sub) => { setEditItem(sub); setFormData({ name: sub.name, code: sub.code, type: sub.type, class_name: sub.class_name }); setShowModal(true); };

  const handleSave = () => {
    if (!formData.name || !formData.code) { toast.error('Name and code are required'); return; }
    if (editItem) {
      setSubjects(subjects.map(s => s.id === editItem.id ? { ...s, ...formData } : s));
      toast.success('Subject updated');
    } else {
      setSubjects([...subjects, { id: Date.now(), ...formData }]);
      toast.success('Subject added');
    }
    setShowModal(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Subjects</h1><p className="subtitle">Manage subjects and their assignments</p></div>
        <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus size={18} /> Add Subject</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-secondary">{filtered.length} subjects</span>
        </div>
        <table>
          <thead><tr><th>Subject Name</th><th>Code</th><th>Type</th><th>Assigned To</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600 }}>{sub.name}</td>
                <td><span className="badge badge-primary">{sub.code}</span></td>
                <td><span className={`badge ${sub.type === 'Theory' ? 'badge-info' : sub.type === 'Practical' ? 'badge-success' : 'badge-warning'}`}>{sub.type}</span></td>
                <td className="text-sm text-secondary">{sub.class_name}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(sub)}><HiOutlinePencil size={15} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => { setSubjects(subjects.filter(s => s.id !== sub.id)); toast.success('Deleted'); }}><HiOutlineTrash size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editItem ? 'Edit Subject' : 'Add Subject'}</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineXMark size={20} /></button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Subject Name *</label><input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Mathematics" /></div>
                <div className="form-group"><label className="form-label">Subject Code *</label><input className="form-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. MATH" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Theory</option><option>Practical</option><option>Theory + Practical</option></select>
                </div>
                <div className="form-group"><label className="form-label">Assigned To</label><input className="form-input" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} placeholder="e.g. All Classes" /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
