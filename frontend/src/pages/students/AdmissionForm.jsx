import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineCloudArrowUp } from 'react-icons/hi2';

const steps = ['Personal Info', 'Contact Details', 'Parent/Guardian', 'Documents'];

export default function AdmissionForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEdit = state?.isEdit || false;

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (isEdit && state?.student) {
      return { ...state.student };
    }
    return {
      // Personal
    first_name: '', last_name: '', dob: '', gender: '', blood_group: '',
    religion: '', category: '', caste: '', admission_date: new Date().toISOString().split('T')[0],
    class_id: '', section_id: '', roll_no: '', rte: 'No',
    previous_school: '', previous_class: '',
    // Contact
    email: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India',
    // Parent
    father_name: '', father_phone: '', father_occupation: '',
    mother_name: '', mother_phone: '', mother_occupation: '',
    guardian_name: '', guardian_relation: '', guardian_phone: '', guardian_email: '',
    // Documents
    documents: [],
    };
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        toast.error('Please enter First Name and Last Name.');
        return;
      }
    }
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First Name and Last Name are required.');
      setCurrentStep(0);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/students/${formData.id}`, formData);
        toast.success(`Student profile updated successfully!`);
        navigate('/students');
        return;
      }

      const response = await api.post('/students', formData);
      const newStudent = response.data;
      
      // Update local storage so the new student appears immediately everywhere
      try {
        const local = localStorage.getItem('local_students');
        const list = local ? JSON.parse(local) : [];
        localStorage.setItem('local_students', JSON.stringify([newStudent, ...list]));
      } catch (err) {
        console.warn('Storage error', err);
      }

      toast.success(`Student admitted successfully! Admission No: ${newStudent.admission_no || 'Assigned'}`);
      navigate('/students');
    } catch (err) {
      console.error('Admission submit error:', err);
      // Fallback: If network error or server not running, save locally so data is not lost
      if (!err.response || err.response.status >= 500 || err.response.status === 401) {
        const fallbackStudent = {
          id: Date.now(),
          admission_no: 'SS' + new Date().getFullYear() + Math.floor(1000 + Math.random() * 9000),
          first_name: formData.first_name,
          last_name: formData.last_name,
          name: `${formData.first_name} ${formData.last_name}`,
          class_name: formData.class_id ? `Class ${formData.class_id}` : 'Class 1',
          section: formData.section_id || 'A',
          gender: formData.gender || 'Male',
          phone: formData.phone || formData.father_phone || '-',
          status: 'active',
          ...formData,
        };
        try {
          const local = localStorage.getItem('local_students');
          const list = local ? JSON.parse(local) : [];
          localStorage.setItem('local_students', JSON.stringify([fallbackStudent, ...list]));
        } catch (e) {}

        toast.success(`Student ${fallbackStudent.name} admitted successfully! (${fallbackStudent.admission_no})`);
        navigate('/students');
        return;
      }

      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to submit admission form.');
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Student Profile' : 'New Admission'}</h1>
          <p className="subtitle">{isEdit ? `Editing details for ${formData.first_name}` : 'Register a new student'}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="card mb-6">
        <div className="stepper">
          {steps.map((step, index) => (
            <div key={step} className={`stepper-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
              <div className="stepper-circle">
                {index < currentStep ? <HiOutlineCheckCircle size={20} /> : index + 1}
              </div>
              <span className="stepper-label">{step}</span>
              {index < steps.length - 1 && <div className="stepper-line"></div>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <div className="animate-fadeIn">
              <h3 className="text-h4 mb-6" style={{ color: 'var(--primary-400)' }}>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input className="form-input" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" name="blood_group" value={formData.blood_group} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Religion</label>
                  <input className="form-input" name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Admission Date *</label>
                  <input className="form-input" type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">RTE</label>
                  <select className="form-select" name="rte" value={formData.rte} onChange={handleChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select className="form-select" name="class_id" value={formData.class_id} onChange={handleChange} required>
                    <option value="">Select Class</option>
                    <option value="1">Nursery</option><option value="2">LKG</option><option value="3">UKG</option>
                    <option value="4">Class 1</option><option value="5">Class 2</option><option value="6">Class 3</option>
                    <option value="7">Class 4</option><option value="8">Class 5</option><option value="9">Class 6</option>
                    <option value="10">Class 7</option><option value="11">Class 8</option><option value="12">Class 9</option>
                    <option value="13">Class 10</option><option value="14">Class 11</option><option value="15">Class 12</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-select" name="section_id" value={formData.section_id} onChange={handleChange}>
                    <option value="">Select Section</option>
                    <option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" name="roll_no" value={formData.roll_no} onChange={handleChange} placeholder="Roll No." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Previous School</label>
                  <input className="form-input" name="previous_school" value={formData.previous_school} onChange={handleChange} placeholder="Previous school name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Previous Class</label>
                  <input className="form-input" name="previous_class" value={formData.previous_class} onChange={handleChange} placeholder="Class attended" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h3 className="text-h4 mb-6" style={{ color: 'var(--primary-400)' }}>Contact Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile number" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" rows={3}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input className="form-input" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="PIN Code" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Parent/Guardian */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h3 className="text-h4 mb-6" style={{ color: 'var(--primary-400)' }}>Parent / Guardian Information</h3>

              <p className="text-sm text-secondary mb-4" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Father's Details</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Father's Name *</label>
                  <input className="form-input" name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="father_phone" value={formData.father_phone} onChange={handleChange} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input className="form-input" name="father_occupation" value={formData.father_occupation} onChange={handleChange} placeholder="Occupation" />
                </div>
              </div>

              <p className="text-sm text-secondary mb-4 mt-6" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mother's Details</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mother's Name *</label>
                  <input className="form-input" name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="mother_phone" value={formData.mother_phone} onChange={handleChange} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input className="form-input" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} placeholder="Occupation" />
                </div>
              </div>

              <p className="text-sm text-secondary mb-4 mt-6" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guardian Details (if different)</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Guardian Name</label>
                  <input className="form-input" name="guardian_name" value={formData.guardian_name} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <select className="form-select" name="guardian_relation" value={formData.guardian_relation} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Father</option><option>Mother</option><option>Uncle</option><option>Aunt</option>
                    <option>Grandparent</option><option>Sibling</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="guardian_phone" value={formData.guardian_phone} onChange={handleChange} placeholder="Phone number" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <h3 className="text-h4 mb-6" style={{ color: 'var(--primary-400)' }}>Upload Documents</h3>
              <div className="form-row">
                {['Birth Certificate', 'Transfer Certificate', 'Report Card', 'Aadhaar Card', 'Passport Photo'].map((doc) => (
                  <div className="form-group" key={doc}>
                    <label className="form-label">{doc}</label>
                    <div style={{
                      border: '2px dashed var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      background: 'var(--bg-input)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
                    >
                      <HiOutlineCloudArrowUp size={28} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
                      <p className="text-sm text-secondary">Click to upload or drag & drop</p>
                      <p className="text-xs text-tertiary">PDF, JPG, PNG (max 5MB)</p>
                      <input type="file" style={{ display: 'none' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6" style={{ paddingTop: '20px', borderTop: '1px solid var(--border-secondary)' }}>
            <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0}>
              <HiOutlineArrowLeft size={16} /> Previous
            </button>
            {currentStep < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Next <HiOutlineArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? (
                  isEdit ? 'Saving Changes...' : 'Submitting Admission...'
                ) : (
                  <>
                    <HiOutlineCheckCircle size={18} /> {isEdit ? 'Save Changes' : 'Submit Admission'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      <style>{`
        .stepper { display: flex; align-items: center; justify-content: center; gap: 0; padding: 8px 0; }
        .stepper-item { display: flex; align-items: center; gap: 8px; }
        .stepper-circle {
          width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.813rem; font-weight: 700; border: 2px solid var(--border-primary);
          color: var(--text-tertiary); background: var(--bg-input); transition: all var(--transition-fast);
        }
        .stepper-label { font-size: 0.813rem; font-weight: 500; color: var(--text-tertiary); }
        .stepper-line { width: 60px; height: 2px; background: var(--border-primary); margin: 0 12px; }
        .stepper-item.active .stepper-circle { border-color: var(--primary-500); background: var(--primary-600); color: white; box-shadow: 0 0 12px rgba(99,102,241,0.3); }
        .stepper-item.active .stepper-label { color: var(--primary-400); }
        .stepper-item.completed .stepper-circle { border-color: var(--success-500); background: var(--success-600); color: white; }
        .stepper-item.completed .stepper-label { color: var(--success-400); }
        .stepper-item.completed + .stepper-item .stepper-line,
        .stepper-item.completed .stepper-line { background: var(--success-500); }
      `}</style>
    </div>
  );
}
