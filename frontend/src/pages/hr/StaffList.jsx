import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const demoStaff = [
  { id: 1, emp_id: 'EMP001', name: 'Rajesh Sharma', role: 'Teacher', department: 'Science', status: 'Active' },
  { id: 2, emp_id: 'EMP002', name: 'Sunita Verma', role: 'Accountant', department: 'Finance', status: 'Active' },
  { id: 3, emp_id: 'EMP003', name: 'Amit Kumar', role: 'Librarian', department: 'Library', status: 'Active' },
];

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaff(data);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.emp_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Staff Directory</h1>
          <p className="subtitle">Manage all school employees</p>
        </div>
        <button className="btn btn-primary"><HiOutlinePlus size={18} /> Add Staff</button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-secondary">{filtered.length} staff</span>
        </div>
        <table>
          <thead>
            <tr><th>Emp ID</th><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>{s.emp_id}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.7rem' }}>
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {s.name}
                  </div>
                </td>
                <td>{s.role}</td>
                <td>{s.department}</td>
                <td><span className="badge badge-success">{s.status}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon btn-sm"><HiOutlineEye size={15} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm"><HiOutlinePencil size={15} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }}><HiOutlineTrash size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
