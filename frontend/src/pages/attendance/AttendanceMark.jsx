import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { useClasses } from '../../hooks/useClasses';

const demoStudents = [
  { id: 1, name: 'Aarav Sharma', roll_no: 1 },
  { id: 2, name: 'Priya Singh', roll_no: 2 },
  { id: 3, name: 'Rohan Patel', roll_no: 3 },
  { id: 4, name: 'Ananya Gupta', roll_no: 4 },
];

export default function AttendanceMark() {
  const classOptions = useClasses();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const handleSearch = () => {
    if (!classId) {
      toast.error('Please select a class');
      return;
    }
    // Mock fetching students
    setStudents(demoStudents);
    const initialAttendance = {};
    demoStudents.forEach(s => {
      initialAttendance[s.id] = 'Present'; // Default
    });
    setAttendance(initialAttendance);
  };

  const handleMark = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const handleSave = () => {
    toast.success('Attendance saved successfully');
    setStudents([]); // reset
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Mark Attendance</h1>
          <p className="subtitle">Record daily student attendance</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Class & Section</label>
            <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select Class</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary w-full" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-h4">Student List</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-success" onClick={() => markAll('Present')}><HiOutlineCheckCircle /> Mark All Present</button>
              <button className="btn btn-sm btn-danger" onClick={() => markAll('Absent')}><HiOutlineXCircle /> Mark All Absent</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Attendance</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.roll_no}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="flex gap-2">
                        {['Present', 'Absent', 'Late', 'Half Day'].map(status => (
                          <label key={status} className="flex items-center gap-1" style={{ cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name={`attendance_${student.id}`} 
                              checked={attendance[student.id] === status} 
                              onChange={() => handleMark(student.id, status)}
                            />
                            <span className="text-sm">{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input type="text" className="form-input" placeholder="Optional note" style={{ padding: '6px 12px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn btn-primary" onClick={handleSave}>Save Attendance</button>
          </div>
        </div>
      )}
    </div>
  );
}
