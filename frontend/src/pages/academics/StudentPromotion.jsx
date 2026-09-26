import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineArrowPath
} from 'react-icons/hi2';

export default function StudentPromotion() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fromSession, setFromSession] = useState('2025-2026');
  const [toSession, setToSession] = useState('2026-2027');
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [toSection, setToSection] = useState('A');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promotionDecisions, setPromotionDecisions] = useState({}); // { [student_id]: 'Promoted' | 'Continued' | 'Left' }
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const [classRes, sessionRes] = await Promise.all([
        api.get('/classes'),
        api.get('/sessions').catch(() => ({ data: [] }))
      ]);

      const classList = Array.isArray(classRes.data) ? classRes.data : [];
      setClasses(classList);
      if (classList.length > 0) {
        setFromClass(String(classList[0].id));
        if (classList.length > 1) {
          setToClass(String(classList[1].id));
        } else {
          setToClass(String(classList[0].id));
        }
      }

      if (Array.isArray(sessionRes.data) && sessionRes.data.length > 0) {
        setSessions(sessionRes.data);
      } else {
        setSessions([
          { id: 1, name: '2025-2026' },
          { id: 2, name: '2026-2027' },
          { id: 3, name: '2024-2025' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load classes/sessions:', err);
    }
  };

  const handleSearchStudents = async () => {
    if (!fromClass) {
      toast.error('Please select source class');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/students');
      const allStudents = Array.isArray(data) ? data : [];
      // Filter by selected fromClass
      const filtered = allStudents.filter(s =>
        String(s.class_id) === String(fromClass) ||
        (s.class_name && classes.find(c => String(c.id) === String(fromClass))?.name === s.class_name)
      );

      // Default all to selected and Promoted
      const decisions = {};
      const ids = [];
      filtered.forEach(s => {
        decisions[s.id] = 'Promoted';
        ids.push(s.id);
      });

      setStudents(filtered);
      setPromotionDecisions(decisions);
      setSelectedIds(ids);

      if (filtered.length === 0) {
        toast('No students currently enrolled in this class.', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to fetch class students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDecisionChange = (id, val) => {
    setPromotionDecisions(prev => ({ ...prev, [id]: val }));
  };

  const handleSavePromotions = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one student to promote');
      return;
    }
    if (!toClass) {
      toast.error('Please select target class');
      return;
    }

    setPromoting(true);
    try {
      const targetClassObj = classes.find(c => String(c.id) === String(toClass));
      const targetClassName = targetClassObj?.name || `Class ${toClass}`;

      await api.post('/academics/promote', {
        student_ids: selectedIds,
        to_class: targetClassName,
        to_section: toSection,
        academic_year: toSession,
        result: 'Promoted'
      });

      toast.success(`Successfully promoted ${selectedIds.length} students to ${targetClassName} (${toSection}) for session ${toSession}!`);
      // Re-fetch students
      handleSearchStudents();
    } catch (err) {
      console.error('Promotion error:', err);
      toast.error(err.response?.data?.message || 'Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Academic Promotion (Module 6)</h1>
          <p className="subtitle text-sm text-secondary">Promote students to the next academic session, advance grade levels, or retain students</p>
        </div>
      </div>

      <div className="card mb-6 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promote From */}
          <div className="p-4 rounded-xl border border-secondary bg-secondary/10">
            <h3 className="font-bold text-sm text-secondary uppercase tracking-wider mb-3">1. Current Enrolled Class</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-group mb-0">
                <label className="form-label text-xs">Current Session</label>
                <select className="form-select text-sm" value={fromSession} onChange={e => setFromSession(e.target.value)}>
                  {sessions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs">Select Source Class *</label>
                <select className="form-select text-sm font-semibold" value={fromClass} onChange={e => setFromClass(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Promote To */}
          <div className="p-4 rounded-xl border border-primary-500/30 bg-primary-500/5">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-3">2. Next Target Promotion Class</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="form-group mb-0">
                <label className="form-label text-xs">Target Session</label>
                <select className="form-select text-sm" value={toSession} onChange={e => setToSession(e.target.value)}>
                  {sessions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs">Target Class *</label>
                <select className="form-select text-sm font-semibold" value={toClass} onChange={e => setToClass(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label text-xs">Section</label>
                <select className="form-select text-sm" value={toSection} onChange={e => setToSection(e.target.value)}>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="btn btn-primary flex items-center gap-2" onClick={handleSearchStudents} disabled={loading}>
            <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
            <span>Load Enrolled Students</span>
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card animate-slideUp">
          <div className="p-4 border-b border-secondary flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">Students Ready For Promotion</span>
              <span className="badge badge-primary">{selectedIds.length} Selected</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-secondary"
                onClick={() => setSelectedIds(students.map(s => s.id))}
              >
                Select All
              </button>
              <button
                className="btn btn-xs btn-secondary"
                onClick={() => setSelectedIds([])}
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Select</th>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Current Class</th>
                  <th>Academic Standing</th>
                  <th>Promotion Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const isChecked = selectedIds.includes(s.id);
                  const decision = promotionDecisions[s.id] || 'Promoted';

                  return (
                    <tr key={s.id} className={isChecked ? 'bg-primary-500/5' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer accent-primary"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(s.id)}
                        />
                      </td>
                      <td>
                        <span className="badge badge-primary font-mono text-xs">
                          {s.admission_no}
                        </span>
                      </td>
                      <td className="font-semibold text-sm">
                        {s.name || `${s.first_name} ${s.last_name}`}
                      </td>
                      <td className="text-secondary text-sm">
                        {s.class_name || `Class ${s.class_id}`}
                      </td>
                      <td>
                        <span className="badge badge-success text-xs">Eligible for Advance</span>
                      </td>
                      <td>
                        <select
                          className="form-select text-xs py-1.5 px-2"
                          style={{ minWidth: '150px' }}
                          value={decision}
                          onChange={e => handleDecisionChange(s.id, e.target.value)}
                        >
                          <option value="Promoted">Promote to Next Class</option>
                          <option value="Continued">Retain in Current Class</option>
                          <option value="Left">Graduated / Left School</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-secondary flex justify-between items-center bg-secondary/5 rounded-b-xl">
            <span className="text-xs text-secondary">
              Promoting to <strong>Class {classes.find(c => String(c.id) === String(toClass))?.name} ({toSection})</strong> for Academic Session <strong>{toSession}</strong>
            </span>
            <button
              className="btn btn-success flex items-center gap-2 font-semibold"
              onClick={handleSavePromotions}
              disabled={promoting || selectedIds.length === 0}
            >
              <HiOutlineCheckCircle size={18} />
              <span>{promoting ? 'Promoting Students...' : `Confirm & Promote (${selectedIds.length} Students)`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
