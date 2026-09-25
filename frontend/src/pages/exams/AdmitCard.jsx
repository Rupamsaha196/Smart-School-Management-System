import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineIdentification, HiOutlinePrinter } from 'react-icons/hi2';
import api from '../../api/axiosInstance';

export default function AdmitCard() {
  const [exam, setExam] = useState('');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [admitCard, setAdmitCard] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/students');
      const uniqueClasses = [...new Set(data.map(s => `${s.class_name || 'Class 10'} - ${s.section || 'A'}`))].sort();
      setClassOptions(uniqueClasses);
    } catch (err) {
      console.warn("Could not fetch classes");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!exam || !classId || !studentId) {
      toast.error('Please select Exam, Class, and enter Student ID');
      return;
    }
    
    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => (s.admission_no || `SS${s.id}`) === studentId);
      
      if (!studentData) {
        toast.error('Student not found with this Admission Number');
        setAdmitCard(null);
        return;
      }
      const actualClass = `${studentData.class_name || 'Class 10'} - ${studentData.section || 'A'}`;
      
      if (actualClass !== classId) {
        toast.error(`Student belongs to ${actualClass}, not ${classId}`);
        setAdmitCard(null);
        return;
      }
      
      setAdmitCard({
        examName: exam,
        studentName: (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim(),
        admissionNo: studentData.admission_no || `SS${studentData.id}`,
        className: actualClass,
        rollNo: studentData.id || '45',
        dob: studentData.date_of_birth || studentData.dob || '2010-05-15',
        fatherName: studentData.father_name || 'Not Available',
        center: 'Main Block - Hall A',
        subjects: [
          { date: '2025-09-10', time: '10:00 AM', subject: 'Mathematics' },
          { date: '2025-09-12', time: '10:00 AM', subject: 'Science' },
          { date: '2025-09-15', time: '10:00 AM', subject: 'English' },
        ]
      });
      toast.success('Admit Card Generated Successfully!');
    } catch (error) {
      toast.error('Failed to fetch student details');
      setAdmitCard(null);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Admit Card</h1>
          <p className="subtitle">Generate and print student admit cards for upcoming examinations</p>
        </div>
      </div>

      <div className="card mb-6">
        <form className="form-row" onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Select Exam</label>
            <select className="form-select" value={exam} onChange={e => setExam(e.target.value)}>
              <option value="">-- Select Exam --</option>
              <option value="Half Yearly Examination 2025">Half Yearly Examination 2025</option>
              <option value="Annual Examination 2026">Annual Examination 2026</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">-- Select Class --</option>
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Student Admission No.</label>
            <input type="text" className="form-input" placeholder="e.g. SS2025001" value={studentId} onChange={e => setStudentId(e.target.value)} />
          </div>
          <div className="form-group flex items-end">
            <button type="submit" className="btn btn-primary w-full" style={{ height: '42px' }}>
              <HiOutlineIdentification size={18} /> Generate
            </button>
          </div>
        </form>
      </div>

      {admitCard && (
        <div className="card animate-slideUp" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex justify-between items-center border-bottom pb-4 mb-4" style={{ borderBottom: '2px solid var(--border-secondary)' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-h2">SS</div>
              <div>
                <h2 className="text-h3 m-0">Smart School</h2>
                <p className="text-secondary text-sm">Excellence in Education</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-h4 m-0 text-primary-500">ADMIT CARD</h3>
              <p className="text-sm font-semibold">{admitCard.examName}</p>
            </div>
          </div>

          <div className="grid-2 gap-4 mb-6">
            <div>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Student Name:</span> <span className="font-semibold">{admitCard.studentName}</span></p>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Father's Name:</span> <span className="font-semibold">{admitCard.fatherName}</span></p>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Date of Birth:</span> <span className="font-semibold">{admitCard.dob}</span></p>
            </div>
            <div>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Admission No:</span> <span className="font-semibold">{admitCard.admissionNo}</span></p>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Class & Sec:</span> <span className="font-semibold">{admitCard.className}</span></p>
              <p className="mb-2"><span className="text-secondary text-sm inline-block w-32">Roll No:</span> <span className="font-semibold">{admitCard.rollNo}</span></p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-md" style={{ background: 'var(--bg-input)' }}>
            <p className="mb-0"><span className="text-secondary text-sm inline-block w-32">Exam Center:</span> <span className="font-semibold">{admitCard.center}</span></p>
          </div>

          <h4 className="text-h5 mb-3">Examination Schedule</h4>
          <div className="table-container mb-6" style={{ border: '1px solid var(--border-secondary)' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Invigilator Sign</th>
                </tr>
              </thead>
              <tbody>
                {admitCard.subjects.map((sub, idx) => (
                  <tr key={idx}>
                    <td>{sub.date}</td>
                    <td>{sub.time}</td>
                    <td className="font-semibold">{sub.subject}</td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end mt-12 pt-6 border-top" style={{ borderTop: '1px dashed var(--border-secondary)' }}>
            <div className="text-center">
              <div className="w-32 border-bottom border-[var(--text-primary)] mb-2"></div>
              <p className="text-sm text-secondary">Student's Signature</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-bottom border-[var(--text-primary)] mb-2"></div>
              <p className="text-sm text-secondary">Principal's Signature</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="btn btn-primary" onClick={() => window.print()}>
              <HiOutlinePrinter size={18} /> Print Admit Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
