import { useState } from 'react';
import toast from 'react-hot-toast';
import { useClasses } from '../../hooks/useClasses';

export default function MarksEntry() {
  const classOptions = useClasses();
  const [examId, setExamId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [students, setStudents] = useState([]);

  const handleSearch = () => {
    if (!examId || !classId || !subjectId) {
      toast.error('Select Exam, Class and Subject');
      return;
    }
    setStudents([
      { id: 1, name: 'Aarav Sharma', marks: '' },
      { id: 2, name: 'Priya Singh', marks: '' },
    ]);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Marks Entry</h1>
          <p className="subtitle">Enter student marks for examinations</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Exam</label>
            <select className="form-select" value={examId} onChange={e => setExamId(e.target.value)}>
              <option value="">Select Exam</option>
              <option value="1">Half Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Class & Section</label>
            <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select Class</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
              <option value="">Select Subject</option>
              <option value="1">Mathematics</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary w-full" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card animate-slideUp">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Marks Obtained (Max: 100)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <input type="number" className="form-input" style={{ width: '120px' }} placeholder="0" />
                    </td>
                    <td>
                      <input type="text" className="form-input" placeholder="e.g. Good" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn btn-primary" onClick={() => { toast.success('Marks saved'); setStudents([]); }}>Save Marks</button>
          </div>
        </div>
      )}
    </div>
  );
}
