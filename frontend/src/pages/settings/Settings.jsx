import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  HiOutlineCog6Tooth,
  HiOutlineBuildingLibrary,
  HiOutlinePrinter,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineArrowPath
} from 'react-icons/hi2';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    school_name: 'Smart School International',
    tagline: 'Excellence in Holistic Education',
    phone: '+91 98765 43210',
    email: 'contact@smartschool.edu',
    address: 'Plot 42, Institutional Area, Sector 15, Noida, UP - 201301',
    active_session: '2025-2026',
    currency: 'INR',
    currency_symbol: '₹',
    receipt_prefix: 'SS-REC-',
    thermal_format: '80mm',
    whatsapp_number: '+919876543210',
    whatsapp_default_message: 'Hello Smart School! I need information about student admissions and fee structure.',
    current_campus: 'Main Campus - Sector 15',
    online_processing_fee_pct: 1.50
  });

  const [availableCampuses, setAvailableCampuses] = useState([
    'Main Campus - Sector 15',
    'North Wing Campus',
    'South City Branch'
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      if (data) {
        setFormData({
          school_name: data.school_name || 'Smart School International',
          tagline: data.tagline || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          active_session: data.active_session || '2025-2026',
          currency: data.currency || 'INR',
          currency_symbol: data.currency_symbol || '₹',
          receipt_prefix: data.receipt_prefix || 'REC-',
          thermal_format: data.thermal_format || '80mm',
          whatsapp_number: data.whatsapp_number || '+919876543210',
          whatsapp_default_message: data.whatsapp_default_message || '',
          current_campus: data.current_campus || 'Main Campus - Sector 15',
          online_processing_fee_pct: data.online_processing_fee_pct || 1.50
        });
        if (Array.isArray(data.available_campuses)) {
          setAvailableCampuses(data.available_campuses);
        }
      }
    } catch (err) {
      console.warn('Could not load settings from server, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', {
        ...formData,
        available_campuses: availableCampuses
      });
      toast.success('School settings and configurations updated successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System & School Settings</h1>
          <p className="subtitle text-sm text-secondary">
            Configure school profile, multi-school campuses, thermal printer formats, WhatsApp and payment processing
          </p>
        </div>
        <button
          className="btn btn-secondary flex items-center gap-2"
          onClick={fetchSettings}
          disabled={loading}
        >
          <HiOutlineArrowPath size={16} className={loading ? 'animate-spin' : ''} />
          <span>Reload</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: School Identity & Profile */}
        <div className="card">
          <div className="card-header border-b border-secondary p-4">
            <span className="card-title flex items-center gap-2 font-bold text-base text-primary">
              <HiOutlineCog6Tooth size={20} /> School Identity & General Profile (Module 44)
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">School Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.school_name}
                  onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">School Tagline / Motto</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Official Phone Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Campus Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Multi-School & Campus Capability (Module 37) */}
        <div className="card">
          <div className="card-header border-b border-secondary p-4">
            <span className="card-title flex items-center gap-2 font-bold text-base text-primary">
              <HiOutlineBuildingLibrary size={20} /> Multi-School & Multi-Campus Institution (Module 37)
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Current Active Campus</label>
                <select
                  className="form-select"
                  value={formData.current_campus}
                  onChange={e => setFormData({ ...formData, current_campus: e.target.value })}
                >
                  {availableCampuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="text-xs text-secondary mt-1 block">
                  Switching active branch filters reports and operational views
                </span>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Active Academic Session</label>
                <select
                  className="form-select"
                  value={formData.active_session}
                  onChange={e => setFormData({ ...formData, active_session: e.target.value })}
                >
                  <option value="2025-2026">2025-2026 (Current Academic Year)</option>
                  <option value="2026-2027">2026-2027 (Upcoming Session)</option>
                  <option value="2024-2025">2024-2025 (Previous Session)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Integration & Widget (Module 19 & 39) */}
        <div className="card">
          <div className="card-header border-b border-secondary p-4">
            <span className="card-title flex items-center gap-2 font-bold text-base text-success-500">
              <HiOutlineChatBubbleLeftRight size={20} /> WhatsApp Gateway & Live Chat Widget (Module 19 & 39)
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">WhatsApp Helpline Number (with country code)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+919876543210"
                  value={formData.whatsapp_number}
                  onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
                <span className="text-xs text-secondary mt-1 block">
                  Used by the floating WhatsApp widget across student, parent and admin panels
                </span>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Default WhatsApp Inquiry Message</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.whatsapp_default_message}
                  onChange={e => setFormData({ ...formData, whatsapp_default_message: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Finance, Thermal Printing & Online Payment (Modules 31 & 35) */}
        <div className="card">
          <div className="card-header border-b border-secondary p-4">
            <span className="card-title flex items-center gap-2 font-bold text-base text-warning-500">
              <HiOutlinePrinter size={20} /> Thermal Printing & Online Payments (Module 31 & 35)
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Thermal Receipt Format</label>
                <select
                  className="form-select"
                  value={formData.thermal_format}
                  onChange={e => setFormData({ ...formData, thermal_format: e.target.value })}
                >
                  <option value="80mm">POS Thermal 80mm (Standard)</option>
                  <option value="58mm">POS Thermal 58mm (Compact)</option>
                </select>
                <span className="text-xs text-secondary mt-1 block">Used for quick POS fee receipts</span>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Receipt Prefix</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={formData.receipt_prefix}
                  onChange={e => setFormData({ ...formData, receipt_prefix: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currency_symbol}
                  onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Online Gateway Fee (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-input"
                  value={formData.online_processing_fee_pct}
                  onChange={e => setFormData({ ...formData, online_processing_fee_pct: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2 px-6 py-2.5 font-semibold text-sm"
            disabled={saving}
          >
            <HiOutlineCheckCircle size={18} />
            <span>{saving ? 'Saving System Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
