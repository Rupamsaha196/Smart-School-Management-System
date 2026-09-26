import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineFunnel
} from 'react-icons/hi2';

export default function StaffAttendance() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState({}); // { [staff_id]: { status, time_in, time_out, remark } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Load staff and attendance on mount and when date changes
  useEffect(() => {
    fetchStaffAndAttendance(date);
  }, [date]);

  const fetchStaffAndAttendance = async (targetDate) => {
    setLoading(true);
    try {
      // 1. Fetch all staff
      const staffRes = await api.get('/staff');
      const staffData = Array.isArray(staffRes.data) ? staffRes.data : [];
      setStaffList(staffData);

      // 2. Fetch existing attendance for targetDate
      let existingAttendance = [];
      try {
        const attRes = await api.get(`/staff/attendance?date=${targetDate}`);
        existingAttendance = Array.isArray(attRes.data) ? attRes.data : [];
      } catch (e) {
        // Fallback to /attendance/staff
        try {
          const fallbackRes = await api.get(`/attendance/staff?date=${targetDate}`);
          existingAttendance = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
        } catch {
          existingAttendance = [];
        }
      }

      // 3. Build attendance mapping
      const attMap = {};
      existingAttendance.forEach(rec => {
        let normalizedStatus = rec.status;
        if (normalizedStatus === 'Half Day') normalizedStatus = 'Half-Day';
        attMap[rec.staff_id] = {
          status: normalizedStatus || 'Present',
          time_in: rec.time_in ? rec.time_in.slice(0, 5) : '',
          time_out: rec.time_out ? rec.time_out.slice(0, 5) : '',
          remark: rec.remark || ''
        };
      });

      // For staff not in attendance records yet, initialize with default
      staffData.forEach(member => {
        if (!attMap[member.id]) {
          attMap[member.id] = {
            status: 'Present',
            time_in: '',
            time_out: '',
            remark: ''
          };
        }
      });

      setAttendance(attMap);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to load staff attendance:', err);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  // Mark status for single staff
  const handleMarkStatus = (staffId, status) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        status
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Update in/out time or remark
  const handleFieldChange = (staffId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Mark All buttons
  const handleMarkAll = (status) => {
    const updated = { ...attendance };
    filteredStaff.forEach(s => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        status
      };
    });
    setAttendance(updated);
    setHasUnsavedChanges(true);
    toast.success(`Marked all ${filteredStaff.length} displayed staff as ${status}`);
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (staffList.length === 0) {
      toast.error('No staff members to save attendance for');
      return;
    }

    setSaving(true);
    try {
      const records = staffList.map(s => {
        const item = attendance[s.id] || { status: 'Present' };
        let sendStatus = item.status || 'Present';
        if (sendStatus === 'Half-Day') sendStatus = 'Half Day';

        return {
          staff_id: s.id,
          status: sendStatus,
          time_in: item.time_in ? item.time_in : null,
          time_out: item.time_out ? item.time_out : null,
          remark: item.remark || null
        };
      });

      // Try /staff/attendance/bulk first
      try {
        await api.post('/staff/attendance/bulk', {
          date,
          records
        });
      } catch (primaryErr) {
        // Fallback to /attendance/staff/bulk
        await api.post('/attendance/staff/bulk', {
          date,
          records
        });
      }

      toast.success(`Attendance for ${date} saved successfully! (${records.length} records)`);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving staff attendance:', err);
      const msg = err.response?.data?.message || 'Failed to save attendance records';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Distinct departments and roles for filters
  const departments = useMemo(() => {
    const depts = new Set(staffList.map(s => s.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [staffList]);

  const roles = useMemo(() => {
    const rSet = new Set(staffList.map(s => s.role).filter(Boolean));
    return ['All', ...Array.from(rSet)];
  }, [staffList]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.emp_id && s.emp_id.toLowerCase().includes(q));

      const matchDept = departmentFilter === 'All' || s.department === departmentFilter;
      const matchRole = roleFilter === 'All' || s.role === roleFilter;

      return matchSearch && matchDept && matchRole;
    });
  }, [staffList, search, departmentFilter, roleFilter]);

  // Statistics
  const counts = useMemo(() => {
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;

    staffList.forEach(s => {
      const st = attendance[s.id]?.status;
      if (st === 'Present') present++;
      else if (st === 'Late') late++;
      else if (st === 'Half-Day' || st === 'Half Day') halfDay++;
      else if (st === 'Absent') absent++;
      else if (st === 'Leave' || st === 'Holiday') leave++;
    });

    return { total: staffList.length, present, late, halfDay, absent, leave };
  }, [staffList, attendance]);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Attendance</h1>
          <p className="subtitle text-sm text-secondary">Record daily attendance, punch times, and leaves for school staff</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="badge badge-warning text-xs animate-pulse">
              ● Unsaved Changes
            </span>
          )}
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={handleSaveAttendance}
            disabled={saving || loading || staffList.length === 0}
          >
            <HiOutlineCheckCircle size={18} />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Date Picker & Quick Actions Bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="form-group mb-0">
              <label className="form-label text-xs font-semibold flex items-center gap-1">
                <HiOutlineCalendarDays size={14} className="text-primary" /> Attendance Date
              </label>
              <input
                type="date"
                className="form-input text-sm py-2"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs opacity-0">Fetch</label>
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => fetchStaffAndAttendance(date)}
                disabled={loading}
              >
                <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
                <span>Fetch Staff List</span>
              </button>
            </div>
          </div>

          {/* Quick Mark Bulk Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-secondary font-medium">Quick Bulk Actions:</span>
            <button
              className="btn btn-sm btn-outline-success border border-success-500/40 text-success-400 hover:bg-success-500/20"
              onClick={() => handleMarkAll('Present')}
              disabled={loading || filteredStaff.length === 0}
              title="Set status of displayed staff to Present"
            >
              <HiOutlineCheck size={14} /> All Present
            </button>
            <button
              className="btn btn-sm btn-outline-warning border border-warning-500/40 text-warning-400 hover:bg-warning-500/20"
              onClick={() => handleMarkAll('Half-Day')}
              disabled={loading || filteredStaff.length === 0}
              title="Set status of displayed staff to Half Day"
            >
              ½ All Half-Day
            </button>
            <button
              className="btn btn-sm btn-outline-danger border border-danger-500/40 text-danger-400 hover:bg-danger-500/20"
              onClick={() => handleMarkAll('Absent')}
              disabled={loading || filteredStaff.length === 0}
              title="Set status of displayed staff to Absent"
            >
              <HiOutlineXMark size={14} /> All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="card">
        {/* KPI Counter Header */}
        <div className="p-4 border-b border-secondary flex flex-wrap items-center justify-between gap-3 bg-secondary/10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary">
              Attendance for {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs text-secondary">({staffList.length} total employees)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="badge badge-success px-2.5 py-1">
              Present: {counts.present}
            </span>
            <span className="badge badge-warning px-2.5 py-1">
              Late: {counts.late}
            </span>
            <span className="badge badge-info px-2.5 py-1">
              Half-Day: {counts.halfDay}
            </span>
            <span className="badge badge-danger px-2.5 py-1">
              Absent: {counts.absent}
            </span>
            {counts.leave > 0 && (
              <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1">
                Leave: {counts.leave}
              </span>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 border-b border-secondary flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="table-search" style={{ minWidth: '220px', flex: '1 1 220px' }}>
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search staff by name or Emp ID..."
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

            <div className="flex items-center gap-1.5 text-xs text-secondary">
              <HiOutlineFunnel size={14} />
              <span>Dept:</span>
              <select
                className="form-select text-xs py-1 px-2"
                style={{ width: 'auto' }}
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-secondary">
              <span>Role:</span>
              <select
                className="form-select text-xs py-1 px-2"
                style={{ width: 'auto' }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="text-xs text-secondary">
            Showing <strong>{filteredStaff.length}</strong> of {staffList.length} staff
          </div>
        </div>

        {/* Attendance Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Staff Member</th>
                <th style={{ width: '15%' }}>Role & Dept</th>
                <th style={{ width: '12%' }}>Current Status</th>
                <th style={{ width: '23%' }}>Mark Attendance</th>
                <th style={{ width: '14%' }}>In / Out Time</th>
                <th style={{ width: '14%' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-secondary">
                    <div className="inline-block animate-spin mr-2">⟳</div> Loading staff attendance records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HiOutlineUserGroup size={36} className="text-tertiary opacity-40" />
                      <div className="font-semibold">No staff found matching filters</div>
                      <p className="text-xs">Adjust your search or department filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(s => {
                  const item = attendance[s.id] || { status: 'Present', time_in: '', time_out: '', remark: '' };
                  const currentStatus = item.status || 'Present';
                  const initials = s.name
                    ? s.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : 'ST';

                  return (
                    <tr key={s.id} className="hover:bg-hover transition-colors">
                      {/* Staff Member */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="avatar-placeholder avatar-sm font-bold bg-primary-500/20 text-primary-400">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{s.name}</div>
                            <span className="badge badge-primary font-mono text-[10px] py-0 px-1.5">
                              {s.emp_id || `EMP${String(s.id).padStart(3, '0')}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td>
                        <div className="text-xs font-semibold">{s.role}</div>
                        <div className="text-[11px] text-tertiary">{s.department || 'General'}</div>
                      </td>

                      {/* Current Status Badge */}
                      <td>
                        <span
                          className={`badge text-xs ${
                            currentStatus === 'Present'
                              ? 'badge-success'
                              : currentStatus === 'Absent'
                              ? 'badge-danger'
                              : currentStatus === 'Late'
                              ? 'badge-warning'
                              : currentStatus === 'Half-Day' || currentStatus === 'Half Day'
                              ? 'badge-info'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              currentStatus === 'Present'
                                ? 'bg-success-500 text-white font-bold'
                                : 'btn-ghost text-success-500 hover:bg-success-500/10'
                            }`}
                            onClick={() => handleMarkStatus(s.id, 'Present')}
                            title="Mark Present"
                          >
                            <HiOutlineCheck size={16} />
                            <span className="text-xs hidden sm:inline">P</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              currentStatus === 'Late'
                                ? 'bg-warning-500 text-black font-bold'
                                : 'btn-ghost text-warning-500 hover:bg-warning-500/10'
                            }`}
                            onClick={() => handleMarkStatus(s.id, 'Late')}
                            title="Mark Late"
                          >
                            <HiOutlineClock size={16} />
                            <span className="text-xs hidden sm:inline">Late</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              currentStatus === 'Half-Day' || currentStatus === 'Half Day'
                                ? 'bg-info-500 text-white font-bold'
                                : 'btn-ghost text-info-500 hover:bg-info-500/10'
                            }`}
                            onClick={() => handleMarkStatus(s.id, 'Half-Day')}
                            title="Mark Half Day"
                          >
                            <span className="text-xs font-bold">½ Day</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              currentStatus === 'Absent'
                                ? 'bg-danger-500 text-white font-bold'
                                : 'btn-ghost text-danger-500 hover:bg-danger-500/10'
                            }`}
                            onClick={() => handleMarkStatus(s.id, 'Absent')}
                            title="Mark Absent"
                          >
                            <HiOutlineXMark size={16} />
                            <span className="text-xs hidden sm:inline">A</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              currentStatus === 'Leave'
                                ? 'bg-purple-600 text-white font-bold'
                                : 'btn-ghost text-purple-400 hover:bg-purple-500/10'
                            }`}
                            onClick={() => handleMarkStatus(s.id, 'Leave')}
                            title="Mark On Leave"
                          >
                            <span className="text-xs">Leave</span>
                          </button>
                        </div>
                      </td>

                      {/* In / Out Time */}
                      <td>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            className="form-input text-xs p-1"
                            style={{ width: '80px' }}
                            value={item.time_in || ''}
                            onChange={e => handleFieldChange(s.id, 'time_in', e.target.value)}
                            title="In Time"
                          />
                          <span className="text-tertiary">-</span>
                          <input
                            type="time"
                            className="form-input text-xs p-1"
                            style={{ width: '80px' }}
                            value={item.time_out || ''}
                            onChange={e => handleFieldChange(s.id, 'time_out', e.target.value)}
                            title="Out Time"
                          />
                        </div>
                      </td>

                      {/* Remarks */}
                      <td>
                        <input
                          type="text"
                          className="form-input text-xs py-1 px-2"
                          placeholder="Note / remark..."
                          value={item.remark || ''}
                          onChange={e => handleFieldChange(s.id, 'remark', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Save Action */}
        <div className="p-4 border-t border-secondary flex flex-wrap items-center justify-between gap-3 bg-secondary/10 rounded-b-xl">
          <div className="text-xs text-secondary">
            {hasUnsavedChanges ? (
              <span className="text-warning-400 font-medium">⚠️ You have unsaved attendance changes for {date}. Click Save Attendance below.</span>
            ) : (
              <span className="text-success-400 font-medium">✓ All attendance changes are up to date</span>
            )}
          </div>
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={handleSaveAttendance}
            disabled={saving || loading || staffList.length === 0}
          >
            <HiOutlineCheckCircle size={18} />
            <span>{saving ? 'Saving Attendance...' : `Save Attendance (${staffList.length} staff)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
