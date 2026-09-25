import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';

export default function Settings() {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>System Settings</h1>
          <p className="subtitle">Configure school profile and preferences</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title flex items-center gap-2"><HiOutlineCog6Tooth /> General Settings</span></div>
        <div className="form-row mb-4">
          <div className="form-group">
            <label className="form-label">School Name</label>
            <input type="text" className="form-input" defaultValue="Smart School" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" defaultValue="+91 9876543210" />
          </div>
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Address</label>
          <textarea className="form-textarea" rows={2} defaultValue="123 MG Road, Sector 15, Noida"></textarea>
        </div>
        <div className="form-row mb-4">
          <div className="form-group">
            <label className="form-label">Active Session</label>
            <select className="form-select">
              <option>2025-2026</option>
              <option>2026-2027</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => toast.success('Settings saved')}>Save Changes</button>
      </div>
    </div>
  );
}
