import { useState } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const demoFees = [
  { id: 1, type: 'Tuition Fee', group: 'Monthly Fees', amount: 2500 },
  { id: 2, type: 'Transport Fee', group: 'Monthly Fees', amount: 1500 },
  { id: 3, type: 'Admission Fee', group: 'One-time Fees', amount: 10000 },
  { id: 4, type: 'Library Fee', group: 'Annual Fees', amount: 1000 },
];

export default function FeeStructure() {
  const [fees, setFees] = useState(demoFees);
  const [showForm, setShowForm] = useState(false);
  const [newFee, setNewFee] = useState({ type: '', group: 'Monthly Fees', amount: '' });

  const handleAddFee = (e) => {
    e.preventDefault();
    if (!newFee.type || !newFee.amount) return;
    setFees([...fees, { id: Date.now(), ...newFee, amount: Number(newFee.amount) }]);
    setShowForm(false);
    setNewFee({ type: '', group: 'Monthly Fees', amount: '' });
  };

  const handleDelete = (id) => {
    setFees(fees.filter(fee => fee.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Fee Structure</h1>
          <p className="subtitle">Manage fee types and amounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : 'Add Fee Type'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Add New Fee Type</span>
          </div>
          <form className="p-4 flex gap-4 items-end flex-wrap" onSubmit={handleAddFee}>
            <div className="form-group mb-0" style={{ flex: 1, minWidth: '200px' }}>
              <label>Fee Type</label>
              <input type="text" className="form-input" placeholder="e.g., Uniform Fee" value={newFee.type} onChange={e => setNewFee({...newFee, type: e.target.value})} required />
            </div>
            <div className="form-group mb-0" style={{ flex: 1, minWidth: '200px' }}>
              <label>Fee Group</label>
              <select className="form-select" value={newFee.group} onChange={e => setNewFee({...newFee, group: e.target.value})}>
                <option>Monthly Fees</option>
                <option>One-time Fees</option>
                <option>Annual Fees</option>
              </select>
            </div>
            <div className="form-group mb-0" style={{ flex: 1, minWidth: '200px' }}>
              <label>Amount (₹)</label>
              <input type="number" className="form-input" placeholder="0" value={newFee.amount} onChange={e => setNewFee({...newFee, amount: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Save Fee</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Fee Group</th>
                <th>Amount (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: 600 }}>{fee.type}</td>
                  <td><span className="badge badge-info">{fee.group}</span></td>
                  <td>₹{fee.amount.toLocaleString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon btn-sm"><HiOutlinePencil size={15} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleDelete(fee.id)}><HiOutlineTrash size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
