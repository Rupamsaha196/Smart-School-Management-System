import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineBuildingOffice2,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineArrowPath
} from 'react-icons/hi2';

const ROLES = [
  'Teacher',
  'Admin',
  'Accountant',
  'Librarian',
  'Receptionist',
  'Principal',
  'Vice Principal',
  'Lab Assistant',
  'Transport Manager',
  'Driver',
  'Security Guard',
  'Support Staff'
];

const DEPARTMENTS = [
  'Science',
  'Mathematics',
  'English',
  'Social Sciences',
  'Hindi',
  'Commerce',
  'Computer Science / IT',
  'Administration',
  'Finance',
  'Library',
  'Transport',
  'Sports',
  'Maintenance'
];

const initialStaffForm = {
  name: '',
  emp_id: '',
  role: 'Teacher',
  designation: '',
  department: 'Science',
  email: '',
  phone: '',
  gender: 'Male',
  dob: '',
  joining_date: new Date().toISOString().split('T')[0],
  qualification: '',
  basic_salary: '',
  status: 'Active',
  bank_name: '',
  account_no: '',
  ifsc_code: '',
  address: '',
  city: '',
  state: '',
  pincode: ''
};

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(initialStaffForm);
  const [submitting, setSubmitting] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [viewItem, setViewItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff');
      if (Array.isArray(data)) {
        setStaff(data);
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
      toast.error('Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData(initialStaffForm);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    setEditItem(member);
    setFormData({
      name: member.name || '',
      emp_id: member.emp_id || '',
      role: member.role || 'Teacher',
      designation: member.designation || '',
      department: member.department || 'General',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'Male',
      dob: member.dob ? member.dob.split('T')[0] : '',
      joining_date: member.joining_date ? member.joining_date.split('T')[0] : '',
      qualification: member.qualification || '',
      basic_salary: member.basic_salary !== null && member.basic_salary !== undefined ? member.basic_salary : '',
      status: member.status || 'Active',
      bank_name: member.bank_name || '',
      account_no: member.account_no || '',
      ifsc_code: member.ifsc_code || '',
      address: member.address || '',
      city: member.city || '',
      state: member.state || '',
      pincode: member.pincode || ''
    });
    setShowEditModal(true);
  };

  // Open View Modal
  const handleOpenView = (member) => {
    setViewItem(member);
  };

  // Open Delete Modal
  const handleOpenDelete = (member) => {
    setItemToDelete(member);
    setShowDeleteModal(true);
  };

  // Save new staff
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Staff name is required');
      return;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        basic_salary: formData.basic_salary !== '' ? parseFloat(formData.basic_salary) : null
      };
      const { data } = await api.post('/staff', payload);
      toast.success(`Staff member "${data.name}" added successfully!`);
      setShowAddModal(false);
      setFormData(initialStaffForm);
      fetchStaff();
    } catch (err) {
      console.error('Error creating staff:', err);
      const msg = err.response?.data?.message || 'Failed to add staff member';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing staff
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Staff name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        basic_salary: formData.basic_salary !== '' ? parseFloat(formData.basic_salary) : null
      };
      const { data } = await api.put(`/staff/${editItem.id}`, payload);
      toast.success(`Staff member "${data.name}" updated successfully!`);
      setShowEditModal(false);
      setEditItem(null);
      fetchStaff();
    } catch (err) {
      console.error('Error updating staff:', err);
      const msg = err.response?.data?.message || 'Failed to update staff member';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete staff
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/staff/${itemToDelete.id}`);
      toast.success(`Staff member "${itemToDelete.name}" removed successfully.`);
      setShowDeleteModal(false);
      setItemToDelete(null);
      if (viewItem && viewItem.id === itemToDelete.id) {
        setViewItem(null);
      }
      setStaff(prev => prev.filter(s => s.id !== itemToDelete.id));
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to delete staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered staff
  const filtered = useMemo(() => {
    return staff.filter(s => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.emp_id && s.emp_id.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q));

      const matchRole = roleFilter === 'All' || s.role === roleFilter;
      const matchDept = deptFilter === 'All' || s.department === deptFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [staff, search, roleFilter, deptFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = staff.length;
    const teaching = staff.filter(s => s.role === 'Teacher').length;
    const adminStaff = staff.filter(s => ['Admin', 'Accountant', 'Receptionist', 'Principal'].includes(s.role)).length;
    const active = staff.filter(s => s.status === 'Active').length;
    return { total, teaching, adminStaff, active };
  }, [staff]);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Directory</h1>
          <p className="subtitle text-sm text-secondary">Manage school employees, teachers, administration and support staff</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2" onClick={fetchStaff} title="Refresh Staff List">
            <HiOutlineArrowPath size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={handleOpenAdd}>
            <HiOutlinePlus size={18} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-500 bg-primary-500/10">
            <HiOutlineUser size={24} />
          </div>
          <div>
            <div className="text-xs text-secondary font-medium uppercase tracking-wider">Total Staff</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-success-500 bg-success-500/10">
            <HiOutlineAcademicCap size={24} />
          </div>
          <div>
            <div className="text-xs text-secondary font-medium uppercase tracking-wider">Teaching Faculty</div>
            <div className="text-2xl font-bold">{stats.teaching}</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-warning-500 bg-warning-500/10">
            <HiOutlineBriefcase size={24} />
          </div>
          <div>
            <div className="text-xs text-secondary font-medium uppercase tracking-wider">Administrative</div>
            <div className="text-2xl font-bold">{stats.adminStaff}</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-info-500 bg-info-500/10">
            <HiOutlineCheckBadge size={24} />
          </div>
          <div>
            <div className="text-xs text-secondary font-medium uppercase tracking-wider">Active Employees</div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="card">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-secondary flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="table-search" style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, email, designation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs text-secondary hover:text-primary mr-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              className="form-select text-sm py-2 px-3"
              style={{ width: 'auto', minWidth: '130px' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Department Filter */}
            <select
              className="form-select text-sm py-2 px-3"
              style={{ width: 'auto', minWidth: '150px' }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Status Filter */}
            <select
              className="form-select text-sm py-2 px-3"
              style={{ width: 'auto', minWidth: '120px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="text-sm text-secondary font-medium">
            Showing <strong className="text-primary">{filtered.length}</strong> of {staff.length} staff
          </div>
        </div>

        {/* Staff Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Role & Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Salary</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-secondary">
                    <div className="inline-block animate-spin mr-2">⟳</div> Loading staff records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HiOutlineUser size={40} className="text-tertiary opacity-40" />
                      <div className="font-semibold text-base">No staff members found</div>
                      <p className="text-xs">Try adjusting your search criteria or add a new staff member</p>
                      <button className="btn btn-sm btn-primary mt-2" onClick={handleOpenAdd}>
                        <HiOutlinePlus size={16} /> Add Staff
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => {
                  const initials = s.name
                    ? s.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : 'ST';
                  const salary = s.basic_salary ? `₹${Number(s.basic_salary).toLocaleString('en-IN')}` : '—';

                  return (
                    <tr key={s.id} className="hover:bg-hover transition-colors">
                      <td>
                        <span className="badge badge-primary font-mono text-xs">
                          {s.emp_id || `EMP${String(s.id).padStart(3, '0')}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar-placeholder avatar-sm font-bold bg-primary-500/20 text-primary-400">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{s.name}</div>
                            {s.qualification && (
                              <div className="text-xs text-tertiary">{s.qualification}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium">{s.role}</div>
                        {s.designation ? (
                          <div className="text-xs text-secondary">{s.designation}</div>
                        ) : (
                          <div className="text-xs text-tertiary opacity-70">Staff</div>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-secondary">{s.department || 'General'}</span>
                      </td>
                      <td>
                        <div className="text-xs flex flex-col gap-0.5">
                          {s.phone && (
                            <span className="flex items-center gap-1 text-secondary">
                              <HiOutlinePhone size={12} className="text-tertiary" /> {s.phone}
                            </span>
                          )}
                          {s.email && (
                            <span className="flex items-center gap-1 text-tertiary truncate max-w-[150px]" title={s.email}>
                              <HiOutlineEnvelope size={12} /> {s.email}
                            </span>
                          )}
                          {!s.phone && !s.email && <span className="text-tertiary">—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-mono font-medium">{salary}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.status === 'Active'
                              ? 'badge-success'
                              : s.status === 'On Leave'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {s.status || 'Active'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="View Staff Profile"
                            onClick={() => handleOpenView(s)}
                          >
                            <HiOutlineEye size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm text-primary"
                            title="Edit Staff Member"
                            onClick={() => handleOpenEdit(s)}
                          >
                            <HiOutlinePencil size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger-400)' }}
                            title="Delete Staff"
                            onClick={() => handleOpenDelete(s)}
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
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD STAFF MODAL                                          */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold">
                  <HiOutlinePlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Add New Staff Member</h2>
                  <p className="text-xs text-secondary">Create a new employee profile with role, payroll & contact information</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body max-h-[72vh] overflow-y-auto space-y-5">
                {/* Section 1: Basic Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineUser size={14} /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="form-group mb-0 md:col-span-2">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Employee ID (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Auto-generated if blank (e.g. EMP005)"
                        value={formData.emp_id}
                        onChange={e => setFormData({ ...formData, emp_id: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Senior PGT Physics"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.joining_date}
                        onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact & Academic */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineEnvelope size={14} /> Contact & Qualifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="form-group mb-0">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="teacher@school.edu"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Highest Qualification</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. M.Sc, B.Ed, Ph.D"
                        value={formData.qualification}
                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Payroll & Banking */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineBanknotes size={14} /> Payroll & Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="form-group mb-0">
                      <label className="form-label">Basic Salary (₹/month)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="form-input"
                        placeholder="e.g. 45000"
                        value={formData.basic_salary}
                        onChange={e => setFormData({ ...formData, basic_salary: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="State Bank of India"
                        value={formData.bank_name}
                        onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Account Number"
                        value={formData.account_no}
                        onChange={e => setFormData({ ...formData, account_no: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0 md:col-span-2">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="SBIN0001234"
                        value={formData.ifsc_code}
                        onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Address */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineMapPin size={14} /> Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="form-group mb-0 md:col-span-4">
                      <label className="form-label">Residential Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="House / Flat No, Street, Landmark"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="City"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="State"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Employee...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT STAFF MODAL                                          */}
      {/* ========================================================= */}
      {showEditModal && editItem && (
        <div className="modal-overlay" onClick={() => !submitting && setShowEditModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold">
                  <HiOutlinePencil size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Staff: {editItem.name}</h2>
                  <p className="text-xs text-secondary font-mono">{editItem.emp_id || `ID: ${editItem.id}`}</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body max-h-[72vh] overflow-y-auto space-y-5">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineUser size={14} /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="form-group mb-0 md:col-span-2">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.emp_id}
                        onChange={e => setFormData({ ...formData, emp_id: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.joining_date}
                        onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Qualifications */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineEnvelope size={14} /> Contact & Qualifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="form-group mb-0">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Highest Qualification</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.qualification}
                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Payroll & Banking */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineBanknotes size={14} /> Payroll & Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="form-group mb-0">
                      <label className="form-label">Basic Salary (₹/month)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="form-input"
                        value={formData.basic_salary}
                        onChange={e => setFormData({ ...formData, basic_salary: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.bank_name}
                        onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.account_no}
                        onChange={e => setFormData({ ...formData, account_no: e.target.value })}
                      />
                    </div>

                    <div className="form-group mb-0 md:col-span-2">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.ifsc_code}
                        onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                    <HiOutlineMapPin size={14} /> Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="form-group mb-0 md:col-span-4">
                      <label className="form-label">Residential Address</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Changes...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW STAFF DETAIL MODAL (EYE BUTTON)                     */}
      {/* ========================================================= */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 font-bold flex items-center justify-center text-lg">
                  {viewItem.name ? viewItem.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'ST'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{viewItem.name}</h2>
                    <span className="badge badge-primary font-mono text-xs">
                      {viewItem.emp_id || `ID: ${viewItem.id}`}
                    </span>
                    <span
                      className={`badge ${
                        viewItem.status === 'Active'
                          ? 'badge-success'
                          : viewItem.status === 'On Leave'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {viewItem.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    {viewItem.designation || viewItem.role} • {viewItem.department} Department
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="modal-body space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/20 p-3 rounded-xl">
                <div>
                  <div className="text-[11px] text-tertiary uppercase font-medium">Role</div>
                  <div className="font-semibold text-sm">{viewItem.role}</div>
                </div>
                <div>
                  <div className="text-[11px] text-tertiary uppercase font-medium">Department</div>
                  <div className="font-semibold text-sm">{viewItem.department || 'General'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-tertiary uppercase font-medium">Joining Date</div>
                  <div className="font-semibold text-sm">
                    {viewItem.joining_date ? new Date(viewItem.joining_date).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-tertiary uppercase font-medium">Basic Salary</div>
                  <div className="font-semibold text-sm text-success-400 font-mono">
                    {viewItem.basic_salary ? `₹${Number(viewItem.basic_salary).toLocaleString('en-IN')}` : '—'}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                  <HiOutlineEnvelope size={14} /> Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-card border border-secondary flex items-center gap-3">
                    <HiOutlinePhone className="text-primary" size={18} />
                    <div>
                      <div className="text-xs text-secondary">Phone Number</div>
                      <div className="font-medium">{viewItem.phone || 'Not provided'}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-secondary flex items-center gap-3">
                    <HiOutlineEnvelope className="text-primary" size={18} />
                    <div>
                      <div className="text-xs text-secondary">Email Address</div>
                      <div className="font-medium">{viewItem.email || 'Not provided'}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-secondary flex items-center gap-3 md:col-span-2">
                    <HiOutlineMapPin className="text-primary shrink-0" size={18} />
                    <div>
                      <div className="text-xs text-secondary">Residential Address</div>
                      <div className="font-medium">
                        {[viewItem.address, viewItem.city, viewItem.state, viewItem.pincode].filter(Boolean).join(', ') || 'No address on file'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic & Professional Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                  <HiOutlineAcademicCap size={14} /> Professional & Personal
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">Qualification</div>
                    <div className="font-medium mt-0.5">{viewItem.qualification || '—'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">Gender</div>
                    <div className="font-medium mt-0.5">{viewItem.gender || '—'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">Date of Birth</div>
                    <div className="font-medium mt-0.5">
                      {viewItem.dob ? new Date(viewItem.dob).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Banking Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5 border-b pb-1 border-secondary">
                  <HiOutlineBanknotes size={14} /> Bank & Payroll Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">Bank Name</div>
                    <div className="font-medium mt-0.5">{viewItem.bank_name || '—'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">Account Number</div>
                    <div className="font-medium mt-0.5 font-mono">{viewItem.account_no || '—'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/10">
                    <div className="text-xs text-tertiary">IFSC Code</div>
                    <div className="font-medium mt-0.5 font-mono">{viewItem.ifsc_code || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => {
                  const item = viewItem;
                  setViewItem(null);
                  handleOpenEdit(item);
                }}
              >
                <HiOutlinePencil size={16} /> Edit Employee
              </button>
              <button className="btn btn-secondary" onClick={() => setViewItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ========================================================= */}
      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={() => !submitting && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-danger-500 font-bold">
                <HiOutlineExclamationTriangle size={22} />
                <span>Confirm Staff Deletion</span>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-secondary">
                Are you sure you want to permanently remove employee{' '}
                <strong className="text-primary">{itemToDelete.name}</strong> ({itemToDelete.emp_id || `ID: ${itemToDelete.id}`})?
              </p>
              <div className="mt-3 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-xs text-danger-400">
                ⚠️ This will delete the employee record and any associated attendance or payroll records permanently.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
