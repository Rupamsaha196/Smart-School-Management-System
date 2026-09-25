import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import {
  HiOutlineUser, HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin,
  HiOutlineAcademicCap, HiOutlineBanknotes, HiOutlineCheckCircle,
  HiOutlineDocumentText, HiOutlineArrowLeft, HiOutlinePencil,
} from 'react-icons/hi2';

const studentData = {
  id: 1, admission_no: 'SS2025001', first_name: 'Aarav', last_name: 'Sharma',
  dob: '2012-05-15', gender: 'Male', blood_group: 'B+', religion: 'Hindu',
  category: 'General', class_name: 'Class 5', section: 'A', roll_no: 12,
  admission_date: '2023-04-01', rte: 'No', status: 'active',
  email: 'aarav.parent@email.com', phone: '9876543210',
  address: '123 MG Road, Sector 15', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301',
  father_name: 'Rajesh Sharma', father_phone: '9876543200', father_occupation: 'Engineer',
  mother_name: 'Sunita Sharma', mother_phone: '9876543201', mother_occupation: 'Teacher',
};

const feeHistory = [
  { id: 1, type: 'Tuition Fee', amount: 12500, paid: 12500, status: 'Paid', date: '2025-04-10', month: 'April' },
  { id: 2, type: 'Tuition Fee', amount: 12500, paid: 12500, status: 'Paid', date: '2025-05-08', month: 'May' },
  { id: 3, type: 'Tuition Fee', amount: 12500, paid: 12500, status: 'Paid', date: '2025-06-12', month: 'June' },
  { id: 4, type: 'Transport Fee', amount: 3000, paid: 3000, status: 'Paid', date: '2025-04-10', month: 'Q1' },
  { id: 5, type: 'Tuition Fee', amount: 12500, paid: 0, status: 'Pending', date: '', month: 'September' },
];

const examResults = [
  { exam: 'Unit Test 1', subject: 'Mathematics', marks: 42, total: 50, grade: 'A+' },
  { exam: 'Unit Test 1', subject: 'Science', marks: 38, total: 50, grade: 'A' },
  { exam: 'Unit Test 1', subject: 'English', marks: 44, total: 50, grade: 'A+' },
  { exam: 'Unit Test 1', subject: 'Hindi', marks: 36, total: 50, grade: 'A' },
  { exam: 'Unit Test 1', subject: 'Social Studies', marks: 40, total: 50, grade: 'A+' },
];

const attendanceSummary = { total: 120, present: 112, absent: 6, late: 2, percentage: 93.3 };

export default function StudentProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudent(data);
    } catch (err) {
      console.warn('Failed to load student from API, checking local cache', err);
      try {
        const local = localStorage.getItem('local_students');
        if (local) {
          const list = JSON.parse(local);
          const found = list.find((s) => String(s.id) === String(id));
          if (found) {
            setStudent(found);
            return;
          }
        }
      } catch (e) {}
      // Fallback to demo student if id matches
      if (String(id) === '1') {
        setStudent(studentData);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center" style={{ padding: '60px' }}>
        <p className="text-secondary">Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card text-center" style={{ padding: '60px' }}>
        <h3 className="text-h4 mb-2">Student Not Found</h3>
        <p className="text-secondary mb-4">The requested student record could not be loaded.</p>
        <Link to="/students" className="btn btn-primary">
          <HiOutlineArrowLeft size={16} /> Back to Student List
        </Link>
      </div>
    );
  }

  const s = student;
  const feeHistory = student.fees || [];
  const examResults = student.exam_results || []; // actually the relation is exam_results, wait in laravel camelCase becomes snake_case in JSON response usually, or it remains camelCase depending on serialization. Let's use `exam_results`. Actually it might be `exam_results` since eloquent camel cases to snake cases for relationships in toJson by default. Let's fallback.
  const exams = student.exam_results || student.examResults || [];
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fees' },
    { id: 'exams', label: 'Exam Results' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/students" className="btn btn-ghost btn-icon"><HiOutlineArrowLeft size={20} /></Link>
          <div>
            <h1>Student Profile</h1>
            <p className="subtitle">Admission No: {s.admission_no}</p>
          </div>
        </div>
        <button className="btn btn-primary"><HiOutlinePencil size={16} /> Edit Profile</button>
      </div>

      {/* Profile Header Card */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))' }}>
        <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
          <div className="avatar-placeholder avatar-xl" style={{ fontSize: '1.5rem' }}>
            {s.first_name[0]}{s.last_name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="text-h2">{s.first_name} {s.last_name}</h2>
            <div className="flex gap-3 mt-2" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{s.class_name} - {s.section}</span>
              <span className="badge badge-success">{s.status}</span>
              <span className="badge badge-info">Roll No: {s.roll_no}</span>
            </div>
          </div>
          <div className="grid-stats" style={{ gap: '16px', gridTemplateColumns: 'repeat(3, auto)' }}>
            <div className="text-center">
              <div className="text-h3" style={{ color: 'var(--success-400)' }}>{attendanceSummary.percentage}%</div>
              <div className="text-xs text-secondary">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-h3" style={{ color: 'var(--primary-400)' }}>84%</div>
              <div className="text-xs text-secondary">Exam Avg</div>
            </div>
            <div className="text-center">
              <div className="text-h3" style={{ color: 'var(--warning-400)' }}>₹12.5K</div>
              <div className="text-xs text-secondary">Fee Due</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid-2 animate-fadeIn">
          <div className="card">
            <div className="card-header"><span className="card-title"><HiOutlineUser style={{ display: 'inline', marginRight: 8 }} />Personal Information</span></div>
            <div className="info-grid">
              {[
                ['Date of Birth', s.dob], ['Gender', s.gender], ['Blood Group', s.blood_group],
                ['Religion', s.religion], ['Category', s.category], ['Admission Date', s.admission_date], ['RTE', s.rte],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                  <span className="text-sm text-secondary">{label}</span>
                  <span className="text-sm" style={{ fontWeight: 500 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title"><HiOutlinePhone style={{ display: 'inline', marginRight: 8 }} />Contact & Family</span></div>
            <div className="info-grid">
              {[
                ['Phone', s.phone], ['Email', s.email], ['Address', `${s.address}, ${s.city}`],
                ['State', `${s.state} - ${s.pincode}`],
                ['Father', `${s.father_name} (${s.father_occupation})`],
                ['Mother', `${s.mother_name} (${s.mother_occupation})`],
                ["Father's Phone", s.father_phone],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-secondary)', gap: '16px' }}>
                  <span className="text-sm text-secondary" style={{ whiteSpace: 'nowrap' }}>{label}</span>
                  <span className="text-sm" style={{ fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="table-container animate-fadeIn">
          <table>
            <thead>
              <tr><th>Month</th><th>Fee Type</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {feeHistory.map((f) => (
                <tr key={f.id}>
                  <td>{f.month}</td><td>{f.type}</td>
                  <td>₹{f.amount.toLocaleString()}</td>
                  <td>₹{f.paid.toLocaleString()}</td>
                  <td style={{ color: f.amount - f.paid > 0 ? 'var(--danger-400)' : 'var(--success-400)' }}>₹{(f.amount - f.paid).toLocaleString()}</td>
                  <td><span className={`badge ${f.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{f.status}</span></td>
                  <td>{f.date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="table-container animate-fadeIn">
          <table>
            <thead>
              <tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Total</th><th>Percentage</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {exams.map((r, i) => (
                <tr key={i}>
                  <td>{r.exam}</td><td>{r.subject}</td>
                  <td style={{ fontWeight: 600 }}>{r.marks}</td><td>{r.total}</td>
                  <td>{((r.marks / r.total) * 100).toFixed(0)}%</td>
                  <td><span className="badge badge-primary">{r.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="grid-stats animate-fadeIn">
          {[
            { label: 'Total Days', value: attendanceSummary.total, cls: 'stat-primary' },
            { label: 'Present', value: attendanceSummary.present, cls: 'stat-success' },
            { label: 'Absent', value: attendanceSummary.absent, cls: 'stat-danger' },
            { label: 'Late', value: attendanceSummary.late, cls: 'stat-warning' },
          ].map((item) => (
            <div key={item.label} className={`stat-card ${item.cls}`}>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card animate-fadeIn">
          <div className="empty-state">
            <HiOutlineDocumentText className="icon" />
            <h3>No Documents Uploaded</h3>
            <p>Upload student documents like birth certificate, transfer certificate, etc.</p>
            <button className="btn btn-primary mt-4">Upload Documents</button>
          </div>
        </div>
      )}
    </div>
  );
}
