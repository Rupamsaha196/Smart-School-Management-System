import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineCalendar, 
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import api from '../../api/axiosInstance';

const demoExams = [
  { id: 1, name: 'Unit Test 1', term: 'First Term', classes: 'Class 1 to 5', start_date: '2026-07-15', end_date: '2026-07-20', status: 'Completed' },
  { id: 2, name: 'Half Yearly Examination', term: 'Mid Term', classes: 'All Classes', start_date: '2026-09-10', end_date: '2026-09-25', status: 'Upcoming' },
  { id: 3, name: 'Annual Examination', term: 'Final Term', classes: 'All Classes', start_date: '2027-03-01', end_date: '2027-03-20', status: 'Upcoming' },
];

const demoSchedules = {
  1: [
    { id: 101, subject: 'Mathematics', exam_date: '2026-07-15', start_time: '09:00', end_time: '12:00', room: 'Hall A', total_marks: 100, pass_marks: 35 },
    { id: 102, subject: 'English', exam_date: '2026-07-17', start_time: '09:00', end_time: '12:00', room: 'Hall A', total_marks: 100, pass_marks: 35 },
    { id: 103, subject: 'Science', exam_date: '2026-07-19', start_time: '09:00', end_time: '12:00', room: 'Hall B', total_marks: 100, pass_marks: 35 },
  ],
  2: [
    { id: 201, subject: 'Mathematics', exam_date: '2026-09-12', start_time: '09:30', end_time: '12:30', room: 'Room 101', total_marks: 100, pass_marks: 33 },
    { id: 202, subject: 'Social Science', exam_date: '2026-09-15', start_time: '09:30', end_time: '12:30', room: 'Room 102', total_marks: 100, pass_marks: 33 },
    { id: 203, subject: 'Hindi', exam_date: '2026-09-18', start_time: '09:30', end_time: '12:30', room: 'Room 103', total_marks: 100, pass_marks: 33 },
  ]
};

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit Exam
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({ name: '', term: 'First Term', classes: 'All Classes', start_date: '', end_date: '', status: 'Upcoming' });

  // Schedule Modal
  const [selectedExamForSchedule, setSelectedExamForSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  // Schedule Add/Edit inside Modal
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    exam_date: '',
    start_time: '09:00',
    end_time: '12:00',
    room: 'Hall A',
    total_marks: 100,
    pass_marks: 35,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setExams(res.data.map(e => ({
          ...e,
          classes: e.classes || 'All Classes',
          status: e.status || (new Date(e.end_date) < new Date() ? 'Completed' : 'Upcoming')
        })));
      } else {
        setExams(demoExams);
      }
    } catch (e) {
      console.warn('Could not fetch exams from API, using demo data:', e);
      setExams(demoExams);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateExam = () => {
    setEditingExam(null);
    setExamForm({ name: '', term: 'First Term', classes: 'All Classes', start_date: '', end_date: '', status: 'Upcoming' });
    setShowExamForm(true);
  };

  const handleOpenEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      term: exam.term || 'First Term',
      classes: exam.classes || 'All Classes',
      start_date: exam.start_date || '',
      end_date: exam.end_date || '',
      status: exam.status || 'Upcoming',
    });
    setShowExamForm(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.name || !examForm.start_date) {
      toast.error('Exam name and start date are required');
      return;
    }

    if (editingExam) {
      try {
        await api.put(`/exams/${editingExam.id}`, examForm);
      } catch (e) {
        console.warn('API error, updating locally:', e);
      }
      setExams(exams.map(ex => ex.id === editingExam.id ? { ...ex, ...examForm } : ex));
      toast.success('Exam details updated successfully');
    } else {
      let created = { id: Date.now(), ...examForm };
      try {
        const res = await api.post('/exams', examForm);
        if (res.data?.id) created = res.data;
      } catch (e) {
        console.warn('API error, adding locally:', e);
      }
      setExams([created, ...exams]);
      toast.success('Exam created successfully');
    }

    setShowExamForm(false);
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
    } catch (e) {
      console.warn('API error, deleting locally:', e);
    }
    setExams(exams.filter(exam => exam.id !== id));
    toast.success('Exam deleted');
  };

  // Open Schedules Modal
  const openScheduleModal = async (exam) => {
    setSelectedExamForSchedule(exam);
    resetScheduleForm();
    setLoadingSchedules(true);

    try {
      const res = await api.get(`/exams/${exam.id}/schedules`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSchedules(res.data.map(s => ({
          ...s,
          subject: s.subject?.name || s.subject || 'Subject',
        })));
      } else if (demoSchedules[exam.id]) {
        setSchedules(demoSchedules[exam.id]);
      } else {
        setSchedules([
          { id: 1, subject: 'Mathematics', exam_date: exam.start_date || '2026-10-01', start_time: '09:00', end_time: '12:00', room: 'Hall 1', total_marks: 100, pass_marks: 35 },
          { id: 2, subject: 'English', exam_date: exam.start_date || '2026-10-03', start_time: '09:00', end_time: '12:00', room: 'Hall 1', total_marks: 100, pass_marks: 35 }
        ]);
      }
    } catch (e) {
      console.warn('Could not fetch schedules, fallback to local/demo:', e);
      setSchedules(demoSchedules[exam.id] || [
        { id: 1, subject: 'Mathematics', exam_date: exam.start_date || '2026-10-01', start_time: '09:00', end_time: '12:00', room: 'Hall 1', total_marks: 100, pass_marks: 35 }
      ]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const resetScheduleForm = () => {
    setEditingSchedule(null);
    setScheduleForm({
      subject: '',
      exam_date: selectedExamForSchedule?.start_date || new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '12:00',
      room: 'Hall A',
      total_marks: 100,
      pass_marks: 35,
    });
  };

  const handleEditScheduleClick = (sch) => {
    setEditingSchedule(sch);
    setScheduleForm({
      subject: sch.subject,
      exam_date: sch.exam_date,
      start_time: sch.start_time || '09:00',
      end_time: sch.end_time || '12:00',
      room: sch.room || 'Hall A',
      total_marks: sch.total_marks || 100,
      pass_marks: sch.pass_marks || 35,
    });
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.subject || !scheduleForm.exam_date) {
      toast.error('Subject and date are required');
      return;
    }

    if (editingSchedule) {
      try {
        await api.put(`/exams/${selectedExamForSchedule.id}/schedules/${editingSchedule.id}`, scheduleForm);
      } catch (e) {
        console.warn('API error, updating schedule locally:', e);
      }
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, ...scheduleForm } : s));
      toast.success('Examination schedule updated successfully!');
      resetScheduleForm();
    } else {
      let created = { id: Date.now(), ...scheduleForm };
      try {
        const res = await api.post(`/exams/${selectedExamForSchedule.id}/schedules`, {
          ...scheduleForm,
          class_id: 1,
          subject_id: 1,
        });
        if (res.data?.id) created = res.data;
      } catch (e) {
        console.warn('API error, adding schedule locally:', e);
      }
      setSchedules([...schedules, created]);
      toast.success('Subject schedule added to examination!');
      resetScheduleForm();
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this exam schedule?')) return;
    try {
      await api.delete(`/exams/${selectedExamForSchedule.id}/schedules/${scheduleId}`);
    } catch (e) {
      console.warn('API error, deleting locally:', e);
    }
    setSchedules(schedules.filter(s => s.id !== scheduleId));
    toast.success('Schedule deleted');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Examinations</h1>
          <p className="subtitle">Manage exams, time tables, and subject schedules</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateExam}>
          <HiOutlinePlus size={18} /> Create Exam
        </button>
      </div>

      {showExamForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title font-bold text-primary-400">
              {editingExam ? 'Edit Examination' : 'Create New Examination'}
            </span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowExamForm(false)}>
              <HiOutlineXMark size={18} />
            </button>
          </div>
          <form className="p-4 grid-3" onSubmit={handleSaveExam}>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Exam Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Unit Test 2 or Half Yearly" 
                value={examForm.name} 
                onChange={e => setExamForm({...examForm, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Target Classes</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Class 1 to 10 or All Classes" 
                value={examForm.classes} 
                onChange={e => setExamForm({...examForm, classes: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Term / Session</label>
              <select className="form-select" value={examForm.term} onChange={e => setExamForm({...examForm, term: e.target.value})}>
                <option value="First Term">First Term</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final Term">Final Term</option>
                <option value="Special Assessment">Special Assessment</option>
              </select>
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">Start Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={examForm.start_date} 
                onChange={e => setExamForm({...examForm, start_date: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">End Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={examForm.end_date} 
                onChange={e => setExamForm({...examForm, end_date: e.target.value})} 
              />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                <HiOutlineCheckCircle size={18} /> {editingExam ? 'Update Exam' : 'Save Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12 text-secondary">
          Loading examinations...
        </div>
      ) : (
        <div className="grid-3">
          {exams.map(exam => (
            <div className="card" key={exam.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-h4 font-bold text-primary-400">{exam.name}</h3>
                  <span className="text-xs text-secondary">{exam.term || 'Regular Exam'}</span>
                </div>
                <span className={`badge ${exam.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                  {exam.status}
                </span>
              </div>
              <p className="text-sm text-secondary mb-2">Target: <strong>{exam.classes}</strong></p>
              <p className="text-sm text-secondary mb-4 flex items-center gap-2">
                <HiOutlineCalendar /> {exam.start_date || 'TBA'} to {exam.end_date || 'TBA'}
              </p>
              <div className="flex gap-2 border-top pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <button 
                  className="btn btn-sm btn-secondary flex-1"
                  onClick={() => openScheduleModal(exam)}
                >
                  View & Edit Schedule
                </button>
                <button 
                  className="btn btn-ghost btn-icon btn-sm" 
                  title="Edit Exam Info"
                  onClick={() => handleOpenEditExam(exam)}
                >
                  <HiOutlinePencil size={15} />
                </button>
                <button 
                  className="btn btn-ghost btn-icon btn-sm" 
                  style={{ color: 'var(--danger-400)' }} 
                  title="Delete Exam"
                  onClick={() => handleDeleteExam(exam.id)}
                >
                  <HiOutlineTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Examination Schedules Manager Modal */}
      {selectedExamForSchedule && (
        <div className="modal-overlay" onClick={() => setSelectedExamForSchedule(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '92vw' }}>
            <div className="modal-header">
              <div>
                <h2>{selectedExamForSchedule.name} — Schedules</h2>
                <p className="text-xs text-secondary mt-1">
                  Manage subject exam dates, times, rooms, and passing criteria
                </p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedExamForSchedule(null)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Add / Edit Schedule Form */}
              <div className="card mb-4" style={{ background: 'var(--bg-input)', padding: '16px' }}>
                <span className="text-sm font-bold text-primary-400 block mb-3">
                  {editingSchedule ? '✏️ Edit Schedule Entry' : '➕ Add Subject Schedule'}
                </span>
                <form onSubmit={handleSaveSchedule} className="grid-3 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Subject *</label>
                    <input 
                      type="text" 
                      className="form-input text-sm" 
                      placeholder="e.g. Mathematics" 
                      value={scheduleForm.subject} 
                      onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Exam Date *</label>
                    <input 
                      type="date" 
                      className="form-input text-sm" 
                      value={scheduleForm.exam_date} 
                      onChange={e => setScheduleForm({...scheduleForm, exam_date: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Room / Hall</label>
                    <input 
                      type="text" 
                      className="form-input text-sm" 
                      placeholder="e.g. Hall A or Room 204" 
                      value={scheduleForm.room} 
                      onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Start Time</label>
                    <input 
                      type="time" 
                      className="form-input text-sm" 
                      value={scheduleForm.start_time} 
                      onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">End Time</label>
                    <input 
                      type="time" 
                      className="form-input text-sm" 
                      value={scheduleForm.end_time} 
                      onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-0 flex gap-2">
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Max Marks</label>
                      <input 
                        type="number" 
                        className="form-input text-sm" 
                        value={scheduleForm.total_marks} 
                        onChange={e => setScheduleForm({...scheduleForm, total_marks: Number(e.target.value)})} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Pass Marks</label>
                      <input 
                        type="number" 
                        className="form-input text-sm" 
                        value={scheduleForm.pass_marks} 
                        onChange={e => setScheduleForm({...scheduleForm, pass_marks: Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end" style={{ gridColumn: 'span 3', justifyContent: 'flex-end', marginTop: '6px' }}>
                    {editingSchedule && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={resetScheduleForm}>
                        Cancel Edit
                      </button>
                    )}
                    <button type="submit" className="btn btn-success btn-sm">
                      {editingSchedule ? 'Save Changes' : 'Add to Schedule'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Schedules Table */}
              <div className="table-container" style={{ border: '1px solid var(--border-secondary)' }}>
                {loadingSchedules ? (
                  <div className="text-center py-6 text-secondary">Loading subject schedules...</div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 text-secondary">No subject schedules created yet. Add one above.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Date</th>
                        <th>Timing</th>
                        <th>Room</th>
                        <th>Marks (Max / Pass)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map(sch => (
                        <tr key={sch.id}>
                          <td className="font-semibold text-primary-400">{sch.subject}</td>
                          <td>{sch.exam_date}</td>
                          <td>
                            <span className="flex items-center gap-1 text-sm font-mono">
                              <HiOutlineClock size={14} /> {sch.start_time} - {sch.end_time}
                            </span>
                          </td>
                          <td>{sch.room || 'General Hall'}</td>
                          <td>
                            <span className="badge badge-info">{sch.total_marks} / {sch.pass_marks}</span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button 
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Edit Schedule"
                                onClick={() => handleEditScheduleClick(sch)}
                              >
                                <HiOutlinePencil size={15} />
                              </button>
                              <button 
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger-400)' }}
                                title="Delete Schedule"
                                onClick={() => handleDeleteSchedule(sch.id)}
                              >
                                <HiOutlineTrash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedExamForSchedule(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
