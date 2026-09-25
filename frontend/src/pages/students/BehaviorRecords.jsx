import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlinePlus } from 'react-icons/hi2';
import api from '../../api/axiosInstance';

const initialRecords = [
  { id: 1, studentName: 'Ravi Kumar', admissionNo: 'SS2025001', class: 'Class 10 - A', incident: 'Helped clean the lab', type: 'Positive', date: '2025-09-20', reportedBy: 'Mr. Sharma' },
  { id: 2, title: 'Bullying complaint', studentName: 'Amit Singh', admissionNo: 'SS2025042', class: 'Class 9 - B', incident: 'Disruptive during assembly', type: 'Negative', date: '2025-09-21', reportedBy: 'Mrs. Verma' },
];

export default function BehaviorRecords() {
  const [records, setRecords] = useState(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    incident: '',
    type: 'Positive',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.studentId || !newRecord.incident) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => (s.admission_no || `SS${s.id}`) === newRecord.studentId);
      
      if (!studentData) {
        toast.error('Student not found with this Admission Number');
        return;
      }
      
      const studentName = (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim();
      const studentClass = `${studentData.class_name || 'General'} - ${studentData.section || 'A'}`;

      setRecords([{
        id: Date.now(),
        studentName: studentName,
        admissionNo: newRecord.studentId,
        class: studentClass,
        incident: newRecord.incident,
        type: newRecord.type,
        date: newRecord.date,
        reportedBy: 'Admin'
      }, ...records]);

      setShowForm(false);
      setNewRecord({ studentId: '', incident: '', type: 'Positive', date: new Date().toISOString().split('T')[0] });
      toast.success('Behavior record added successfully!');
    } catch (error) {
      toast.error('Failed to verify student data');
    }
  };

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
            <input type="text" placeholder="Search logs..." />
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
              {records.map(record => (
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
                    <button className="btn btn-sm btn-ghost text-primary-400">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
