import { useState } from 'react';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineClock } from 'react-icons/hi2';

const staffMembers = [
  { id: 1, name: 'John Doe', role: 'Teacher', department: 'Mathematics' },
  { id: 2, name: 'Jane Smith', role: 'Accountant', department: 'Finance' },
  { id: 3, name: 'Robert Johnson', role: 'Teacher', department: 'Science' },
  { id: 4, name: 'Emily Davis', role: 'Librarian', department: 'Library' },
];

export default function StaffAttendance() {
  const [date, setDate] = useState('2025-10-15');
  const [attendance, setAttendance] = useState({
    1: 'Present',
    2: 'Late',
    3: 'Absent',
    4: 'Half-Day',
  });

  const handleMark = (id, status) => {
    setAttendance({ ...attendance, [id]: status });
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Staff Attendance</h1>
          <p className="subtitle">Record daily attendance for teaching and non-teaching staff</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4 items-end">
          <div className="form-group mb-0" style={{ flex: 1 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary">Fetch Staff List</button>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-container">
          <div className="table-toolbar">
            <span className="card-title">Attendance for {date}</span>
            <div className="flex gap-2">
               <span className="badge badge-success">Present: {Object.values(attendance).filter(v => v === 'Present').length}</span>
               <span className="badge badge-warning">Late/Half: {Object.values(attendance).filter(v => ['Late', 'Half-Day'].includes(v)).length}</span>
               <span className="badge badge-danger">Absent: {Object.values(attendance).filter(v => v === 'Absent').length}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Role / Dept</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map(staff => (
                <tr key={staff.id}>
                  <td className="font-semibold">{staff.name}</td>
                  <td>{staff.role} <span className="text-tertiary">({staff.department})</span></td>
                  <td>
                    <span className={`badge badge-${
                      attendance[staff.id] === 'Present' ? 'success' :
                      attendance[staff.id] === 'Absent' ? 'danger' :
                      attendance[staff.id] === 'Late' ? 'warning' : 'info'
                    }`}>
                      {attendance[staff.id] || 'Not Marked'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-ghost text-success" onClick={() => handleMark(staff.id, 'Present')} title="Present">
                        <HiOutlineCheck size={18} />
                      </button>
                      <button className="btn btn-sm btn-ghost text-warning" onClick={() => handleMark(staff.id, 'Late')} title="Late">
                        <HiOutlineClock size={18} />
                      </button>
                      <button className="btn btn-sm btn-ghost text-info" onClick={() => handleMark(staff.id, 'Half-Day')} title="Half Day">
                        1/2
                      </button>
                      <button className="btn btn-sm btn-ghost text-danger" onClick={() => handleMark(staff.id, 'Absent')} title="Absent">
                        <HiOutlineXMark size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-pagination justify-end">
            <button className="btn btn-success">Save Attendance</button>
          </div>
        </div>
      </div>
    </div>
  );
}
