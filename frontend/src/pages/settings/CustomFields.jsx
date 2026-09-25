import { useState, useEffect } from 'react';
import { HiOutlineDocumentPlus, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function CustomFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newField, setNewField] = useState({ form: 'Student Admission', label: '', type: 'Text', required: false });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const { data } = await api.get('/custom-fields');
      setFields(data);
    } catch (err) {
      toast.error('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.label) return;

    try {
      const { data } = await api.post('/custom-fields', newField);
      setFields([data, ...fields]);
      setShowForm(false);
      setNewField({ form: 'Student Admission', label: '', type: 'Text', required: false });
      toast.success('Custom field created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create field');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this custom field?')) return;
    try {
      await api.delete(`/custom-fields/${id}`);
      setFields(fields.filter(f => f.id !== id));
      toast.success('Custom field removed');
    } catch {
      toast.error('Failed to remove field');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Custom Fields</h1>
          <p className="subtitle">Extend the application by adding your own data fields to forms</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add Custom Field'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Create New Field</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddField}>
            <div className="form-group mb-0">
              <label>Target Form</label>
              <select className="form-select" value={newField.form} onChange={e => setNewField({...newField, form: e.target.value})}>
                <option>Student Admission</option>
                <option>Staff Record</option>
                <option>Visitor Log</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Field Label</label>
              <input type="text" className="form-input" placeholder="e.g. Allergies" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Input Type</label>
              <select className="form-select" value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})}>
                <option>Text</option>
                <option>Number</option>
                <option>Date</option>
                <option>Dropdown</option>
              </select>
            </div>
            <div className="form-group flex items-center mb-0 mt-4 gap-2">
              <input type="checkbox" id="req" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} />
              <label htmlFor="req" className="mb-0 cursor-pointer">Is Required?</label>
            </div>
            <div className="form-group flex items-end mb-0 mt-4" style={{ gridColumn: 'span 2', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">Save Field</button>
            </div>
          </form>
        </div>
      )}

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineDocumentPlus/> Registered Custom Fields</span>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center"><span className="spinner"></span></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Target Form</th>
                  <th>Field Label</th>
                  <th>Input Type</th>
                  <th>Required</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-secondary p-4">No custom fields defined</td></tr>
                ) : fields.map(field => (
                  <tr key={field.id}>
                    <td className="font-semibold text-primary-400">{field.form}</td>
                    <td>{field.label}</td>
                    <td><span className="badge badge-info">{field.type}</span></td>
                    <td>{field.required ? <span className="text-danger">Yes</span> : <span className="text-secondary">No</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost text-danger-400" onClick={() => handleDelete(field.id)}>
                        <HiOutlineTrash size={14}/> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
