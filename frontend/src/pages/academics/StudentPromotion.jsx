import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineArrowRight } from 'react-icons/hi2';

const demoStudents = [
  { id: 1, name: 'Aarav Sharma', admission_no: 'SS2025001', result: 'Pass', marks: '85%' },
  { id: 2, name: 'Priya Singh', admission_no: 'SS2025002', result: 'Pass', marks: '92%' },
  { id: 3, name: 'Rohan Patel', admission_no: 'SS2025003', result: 'Fail', marks: '32%' },
];

export default function StudentPromotion() {
  const [promoteFromSession, setPromoteFromSession] = useState('2024-2025');
  const [promoteToSession, setPromoteToSession] = useState('2025-2026');
  const [promoteFromClass, setPromoteFromClass] = useState('');
  const [promoteToClass, setPromoteToClass] = useState('');
  const [students, setStudents] = useState([]);

  const handleSearch = () => {
    if (!promoteFromClass || !promoteToClass) {
      toast.error('Please select both classes');
      return;
    }
    setStudents(demoStudents);
  };

  const handlePromote = () => {
    toast.success('Students promoted successfully to the next session!');
    setStudents([]);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Student Promotion</h1>
          <p className="subtitle">Promote students to next academic session/class</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid-2 gap-6">
          {/* Promote From */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-input)' }}>
            <h3 className="text-h4 mb-4">Promote From</h3>
            <div className="form-group">
              <label className="form-label">Session</label>
              <select className="form-select" value={promoteFromSession} onChange={e => setPromoteFromSession(e.target.value)}>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Class & Section</label>
              <select className="form-select" value={promoteFromClass} onChange={e => setPromoteFromClass(e.target.value)}>
                <option value="">Select Class</option>
                <option value="4">Class 4 - A</option>
              </select>
            </div>
          </div>

          {/* Promote To */}
          <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))', border: '1px solid var(--primary-500)' }}>
            <h3 className="text-h4 mb-4 text-primary-400">Promote To</h3>
            <div className="form-group">
              <label className="form-label">Session</label>
              <select className="form-select" value={promoteToSession} onChange={e => setPromoteToSession(e.target.value)}>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Class & Section</label>
              <select className="form-select" value={promoteToClass} onChange={e => setPromoteToClass(e.target.value)}>
                <option value="">Select Class</option>
                <option value="5">Class 5 - A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={handleSearch}>Manage Promotion</button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card animate-slideUp">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Current Result</th>
                  <th>Promotion Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>{s.admission_no}</td>
                    <td>{s.name}</td>
                    <td><span className={`badge ${s.result === 'Pass' ? 'badge-success' : 'badge-danger'}`}>{s.result} ({s.marks})</span></td>
                    <td>
                      <select className="form-select" style={{ minWidth: '120px' }}>
                        <option>Promote</option>
                        <option>Continue in same class</option>
                        <option>Leave School</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--primary-400)' }}><HiOutlineArrowRight /> View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn btn-success" onClick={handlePromote}>Save Promotions</button>
          </div>
        </div>
      )}
    </div>
  );
}
