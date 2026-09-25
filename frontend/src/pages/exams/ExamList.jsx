import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi2';

const demoExams = [
  { id: 1, name: 'Unit Test 1', classes: 'Class 1 to 5', start_date: '2025-07-15', end_date: '2025-07-20', status: 'Completed' },
  { id: 2, name: 'Half Yearly Examination', classes: 'All Classes', start_date: '2025-09-10', end_date: '2025-09-25', status: 'Upcoming' },
  { id: 3, name: 'Annual Examination', classes: 'All Classes', start_date: '2026-03-01', end_date: '2026-03-20', status: 'Upcoming' },
];

export default function ExamList() {
  const [exams, setExams] = useState(demoExams);
  const [showForm, setShowForm] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', classes: '', start_date: '', end_date: '' });

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newExam.name || !newExam.start_date) return;
    setExams([{ 
      id: Date.now(), 
      ...newExam,
      status: 'Upcoming'
    }, ...exams]);
    setShowForm(false);
    setNewExam({ name: '', classes: '', start_date: '', end_date: '' });
    toast.success('Exam created successfully');
  };

  const handleDelete = (id) => {
    setExams(exams.filter(exam => exam.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Examinations</h1>
          <p className="subtitle">Manage school exams and schedules</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : 'Create Exam'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Create New Exam</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddExam}>
            <div className="form-group mb-0">
              <label>Exam Name</label>
              <input type="text" className="form-input" placeholder="e.g. Unit Test 2" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Target Classes</label>
              <input type="text" className="form-input" placeholder="e.g. Class 10" value={newExam.classes} onChange={e => setNewExam({...newExam, classes: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Start Date</label>
              <input type="date" className="form-input" value={newExam.start_date} onChange={e => setNewExam({...newExam, start_date: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>End Date</label>
              <input type="date" className="form-input" value={newExam.end_date} onChange={e => setNewExam({...newExam, end_date: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-3">
        {exams.map(exam => (
          <div className="card" key={exam.id}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-h4">{exam.name}</h3>
              <span className={`badge ${exam.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                {exam.status}
              </span>
            </div>
            <p className="text-sm text-secondary mb-2">Target: {exam.classes}</p>
            <p className="text-sm text-secondary mb-4 flex items-center gap-2">
              <HiOutlineCalendar /> {exam.start_date} to {exam.end_date}
            </p>
            <div className="flex gap-2 border-top pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              <button className="btn btn-sm btn-secondary flex-1">View Schedule</button>
              <button className="btn btn-ghost btn-icon btn-sm"><HiOutlinePencil size={15} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleDelete(exam.id)}><HiOutlineTrash size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
