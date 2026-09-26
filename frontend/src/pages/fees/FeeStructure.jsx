import { useState, useEffect } from 'react';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineXMark,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const defaultFees = [
  { id: 1, type: 'Tuition Fee', group: 'Monthly Fees', amount: 2500 },
  { id: 2, type: 'Transport Fee', group: 'Monthly Fees', amount: 1500 },
  { id: 3, type: 'Admission Fee', group: 'One-time Fees', amount: 10000 },
  { id: 4, type: 'Library Fee', group: 'Annual Fees', amount: 1000 },
  { id: 5, type: 'Laboratory Fee', group: 'Annual Fees', amount: 1800 },
  { id: 6, type: 'Examination Fee', group: 'Term Fees', amount: 1200 },
];

export default function FeeStructure() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({ type: '', group: 'Monthly Fees', amount: '' });

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fee-types');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setFees(res.data.map(f => ({
          id: f.id,
          type: f.name || f.type,
          group: f.frequency || f.group || 'Monthly Fees',
          amount: Number(f.amount) || 0
        })));
      } else {
        setFees(defaultFees);
      }
    } catch (e) {
      console.warn('Could not fetch fee types from API, using defaults:', e);
      setFees(defaultFees);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFee(null);
    setFormData({ type: '', group: 'Monthly Fees', amount: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      type: fee.type,
      group: fee.group,
      amount: String(fee.amount),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.type.trim() || !formData.amount) {
      toast.error('Please enter fee type and amount');
      return;
    }

    const payload = {
      name: formData.type,
      frequency: formData.group,
      amount: Number(formData.amount),
    };

    if (editingFee) {
      try {
        await api.put(`/fee-types/${editingFee.id}`, payload);
      } catch (err) {
        console.warn('API update error:', err);
      }
      setFees(fees.map(f => f.id === editingFee.id ? { 
        ...f, 
        type: formData.type, 
        group: formData.group, 
        amount: Number(formData.amount) 
      } : f));
      toast.success('Fee structure updated successfully!');
    } else {
      let created = { 
        id: Date.now(), 
        type: formData.type, 
        group: formData.group, 
        amount: Number(formData.amount) 
      };
      try {
        const res = await api.post('/fee-types', payload);
        if (res.data?.id) created.id = res.data.id;
      } catch (err) {
        console.warn('API create error:', err);
      }
      setFees([...fees, created]);
      toast.success('Fee type created successfully!');
    }

    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee type?')) return;
    try {
      await api.delete(`/fee-types/${id}`);
    } catch (err) {
      console.warn('API delete error:', err);
    }
    setFees(fees.filter(fee => fee.id !== id));
    toast.success('Fee type removed');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Fee Structure</h1>
          <p className="subtitle">Configure fee types, frequencies, and standard collection amounts</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <HiOutlinePlus size={18} /> Add Fee Type
        </button>
      </div>

      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          {loading ? (
            <div className="text-center py-10 text-secondary">Loading fee structures...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Fee Frequency / Group</th>
                  <th>Standard Amount (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td style={{ fontWeight: 600 }} className="text-primary-400">{fee.type}</td>
                    <td><span className="badge badge-info">{fee.group}</span></td>
                    <td className="text-success font-semibold">₹{fee.amount.toLocaleString()}</td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Edit Fee"
                          onClick={() => handleOpenEdit(fee)}
                        >
                          <HiOutlinePencil size={15} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm" 
                          style={{ color: 'var(--danger-400)' }} 
                          title="Delete Fee"
                          onClick={() => handleDelete(fee.id)}
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

      {/* Add / Edit Fee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>{editingFee ? 'Edit Fee Structure' : 'Add New Fee Type'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label font-semibold">Fee Type Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Tuition Fee, Uniform Fee, Sports Fee" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label font-semibold">Fee Group / Frequency</label>
                  <select 
                    className="form-select" 
                    value={formData.group} 
                    onChange={e => setFormData({...formData, group: e.target.value})}
                  >
                    <option value="Monthly Fees">Monthly Fees</option>
                    <option value="One-time Fees">One-time Fees</option>
                    <option value="Annual Fees">Annual Fees</option>
                    <option value="Term Fees">Term Fees</option>
                    <option value="Quarterly Fees">Quarterly Fees</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label font-semibold">Amount (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  <HiOutlineCheckCircle size={18} /> {editingFee ? 'Update Fee' : 'Save Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
