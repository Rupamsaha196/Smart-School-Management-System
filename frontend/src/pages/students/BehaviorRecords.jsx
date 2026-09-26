import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineEye, HiOutlineXMark, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi2';
import api from '../../api/axiosInstance';

const defaultRecords = [
  { id: 1, studentName: 'Ravi Kumar', admissionNo: 'SS2025001', class: 'Class 10 - A', incident: 'Helped clean and organize the computer science lab after class.', type: 'Positive', date: '2026-09-20', reportedBy: 'Mr. Sharma' },
  { id: 2, title: 'Class disruption', studentName: 'Amit Singh', admissionNo: 'SS2025042', class: 'Class 9 - B', incident: 'Disruptive behavior during morning assembly and repeated talk during prayer.', type: 'Negative', date: '2026-09-21', reportedBy: 'Mrs. Verma' },
  { id: 3, studentName: 'Priya Sharma', admissionNo: 'SS2025002', class: 'Class 8 - A', incident: 'Awarded first prize in Inter-School Science Olympiad 2026.', type: 'Positive', date: '2026-09-24', reportedBy: 'Principal' },
];

export default function BehaviorRecords() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('school_behavior_records');
      return saved ? JSON.parse(saved) : defaultRecords;
    } catch {
      return defaultRecords;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    incident: '',
    type: 'Positive',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    try {
      localStorage.setItem('school_behavior_records', JSON.stringify(records));
    } catch (e) {
      console.warn(e);
    }
  }, [records]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.studentId || !newRecord.incident) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => (s.admission_no || `SS${s.id}`).toLowerCase() === newRecord.studentId.trim().toLowerCase());
      
      const studentName = studentData
        ? (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim()
        : 'Student ' + newRecord.studentId;
      const studentClass = studentData
        ? `${studentData.class_name || 'General'} - ${studentData.section || 'A'}`
        : 'Class 10 - A';

      // Also persist to student notes API if student exists
      if (studentData?.id) {
        try {
          await api.post(`/students/${studentData.id}/notes`, {
            note: `[${newRecord.type}] ${newRecord.incident}`,
            type: 'Behavior',
          });
        } catch (e) {
          console.warn('Could not post note to backend:', e);
        }
      }

      const created = {
        id: Date.now(),
        studentName: studentName,
        admissionNo: newRecord.studentId.toUpperCase(),
        class: studentClass,
        incident: newRecord.incident,
        type: newRecord.type,
        date: newRecord.date,
        reportedBy: 'Admin'
      };

      setRecords([created, ...records]);
      setShowForm(false);
      setNewRecord({ studentId: '', incident: '', type: 'Positive', date: new Date().toISOString().split('T')[0] });
      toast.success('Behavior record added successfully!');
    } catch (error) {
      toast.error('Failed to verify student data');
    }
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter(r => r.id !== id));
    toast.success('Record removed');
  };

  const filtered = records.filter(r => 
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
    r.incident.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Behavior Records</h1>
          <p className="subtitle">Track and manage student behavioral incidents and achievements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : 'Log Incident / Achievement'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">New Behavior Log</span>
          </div>
          <form className="p-4 grid-2" onSubmit={handleAddRecord}>
            <div className="form-group mb-0">
              <label>Student Admission No.</label>
              <input type="text" className="form-input" placeholder="e.g. SS2025001" value={newRecord.studentId} onChange={e => setNewRecord({...newRecord, studentId: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Record Type</label>
              <select className="form-select" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value})}>
                <option value="Positive">Positive / Achievement</option>
                <option value="Negative">Negative / Incident</option>
                <option value="Neutral">Neutral / Observation</option>
              </select>
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Date of Incident</label>
              <input type="date" className="form-input" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description of Incident</label>
              <textarea className="form-input" placeholder="Describe the behavior or incident..." rows="3" value={newRecord.incident} onChange={e => setNewRecord({...newRecord, incident: e.target.value})} required></textarea>
            </div>
            <div className="form-group flex items-end mb-0" style={{ gridColumn: 'span 2', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">Save Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineUserGroup /> Student Logs</span>
          <div className="table-search">
            <input 
              type="text" 
              placeholder="Search logs by student, admission no, keyword..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Details</th>
                <th>Record Type</th>
                <th>Description</th>
                <th>Reported By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No behavior records found
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>
                      <div className="font-semibold text-primary-400">{record.studentName}</div>
                      <div className="text-xs text-secondary">{record.admissionNo} • {record.class}</div>
                    </td>
                    <td>
                      <span className={`badge ${record.type === 'Positive' ? 'badge-success' : record.type === 'Negative' ? 'badge-danger' : 'badge-info'}`}>
                        {record.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{record.incident}</td>
                    <td>{record.reportedBy}</td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-ghost btn-icon btn-sm" 
                          title="View Incident Details"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm" 
                          style={{ color: 'var(--danger-400)' }}
                          title="Delete Record"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <HiOutlineTrash size={16} />
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

      {/* View Record Details Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Behavior Record Details</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedRecord(null)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                <div>
                  <h3 className="text-h3 font-bold text-primary-400">{selectedRecord.studentName}</h3>
                  <p className="text-sm text-secondary">
                    Admission No: <strong>{selectedRecord.admissionNo}</strong> • Class: <strong>{selectedRecord.class}</strong>
                  </p>
                </div>
                <span className={`badge ${selectedRecord.type === 'Positive' ? 'badge-success' : selectedRecord.type === 'Negative' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {selectedRecord.type}
                </span>
              </div>

              <div className="flex gap-4 mb-4">
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-xs text-secondary block mb-1">Date of Incident</span>
                  <span className="text-sm font-semibold">{selectedRecord.date}</span>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-xs text-secondary block mb-1">Reported By</span>
                  <span className="text-sm font-semibold">{selectedRecord.reportedBy}</span>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label font-semibold">Incident / Achievement Description</label>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  border: '1px solid var(--border-primary)'
                }}>
                  {selectedRecord.incident}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <HiOutlinePrinter size={16} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
