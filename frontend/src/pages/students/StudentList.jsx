import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const demoStudents = [
  { id: 1, admission_no: 'SS2025001', name: 'Aarav Sharma', class_name: 'Class 5', section: 'A', gender: 'Male', phone: '9876543210', status: 'active' },
  { id: 2, admission_no: 'SS2025002', name: 'Priya Singh', class_name: 'Class 8', section: 'B', gender: 'Female', phone: '9876543211', status: 'active' },
  { id: 3, admission_no: 'SS2025003', name: 'Rohan Patel', class_name: 'Class 10', section: 'A', gender: 'Male', phone: '9876543212', status: 'active' },
  { id: 4, admission_no: 'SS2025004', name: 'Ananya Gupta', class_name: 'Class 3', section: 'C', gender: 'Female', phone: '9876543213', status: 'active' },
  { id: 5, admission_no: 'SS2025005', name: 'Vikram Reddy', class_name: 'Class 12', section: 'A', gender: 'Male', phone: '9876543214', status: 'inactive' },
  { id: 6, admission_no: 'SS2025006', name: 'Meera Nair', class_name: 'Class 7', section: 'B', gender: 'Female', phone: '9876543215', status: 'active' },
  { id: 7, admission_no: 'SS2025007', name: 'Arjun Das', class_name: 'Class 9', section: 'A', gender: 'Male', phone: '9876543216', status: 'active' },
  { id: 8, admission_no: 'SS2025008', name: 'Sanya Chopra', class_name: 'Class 6', section: 'A', gender: 'Female', phone: '9876543217', status: 'active' },
];

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        // Fallback to local/demo if database has no students yet
        const local = localStorage.getItem('local_students');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setStudents(parsed.length > 0 ? parsed : demoStudents);
          } catch {
            setStudents(demoStudents);
          }
        } else {
          setStudents(demoStudents);
        }
      }
    } catch (err) {
      console.warn('Could not fetch from API, loading local/demo data:', err);
      const local = localStorage.getItem('local_students');
      if (local) {
        try {
          setStudents(JSON.parse(local));
        } catch {
          setStudents(demoStudents);
        }
      } else {
        setStudents(demoStudents);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success('Student removed successfully');
    } catch {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success('Student removed from list');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const studentList = Array.isArray(students) ? students : [];

  const filtered = studentList.filter((s) => {
    const sName = (s.name || `${s.first_name || ''} ${s.last_name || ''}`).trim();
    const sAdm = s.admission_no || '';
    const matchSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sAdm.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.class_name === filterClass;
    return matchSearch && matchClass;
  });

  const classOptions = [...new Set(studentList.map((s) => s.class_name).filter(Boolean))].sort();

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p className="subtitle">Manage all student records</p>
        </div>
        <Link to="/students/admission" className="btn btn-primary">
          <HiOutlinePlus size={18} /> New Admission
        </Link>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="flex gap-3">
            <div className="table-search">
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 140 }}
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-secondary">{filtered.length} students</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Admission No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                  Loading students...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const displayName = (student.name || `${student.first_name || ''} ${student.last_name || ''}`).trim() || 'Student';
                return (
                  <tr key={student.id}>
                    <td>
                      <span className="text-sm" style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                        {student.admission_no || `SS${student.id}`}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.7rem' }}>
                          {getInitials(displayName)}
                        </div>
                        {displayName}
                      </div>
                    </td>
                    <td>{student.class_name || 'General'}</td>
                    <td>{student.section || 'A'}</td>
                    <td>{student.gender || '-'}</td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {student.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Link to={`/students/${student.id}`} className="btn btn-ghost btn-icon btn-sm" title="View">
                          <HiOutlineEye size={16} />
                        </Link>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm" 
                          title="Edit"
                          onClick={() => navigate('/students/admission', { state: { student, isEdit: true } })}
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Delete"
                          style={{ color: 'var(--danger-400)' }}
                          onClick={() => handleDelete(student.id)}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="table-pagination">
          <span>
            Showing 1 to {filtered.length} of {filtered.length} entries
          </span>
          <div className="pagination-btns">
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
