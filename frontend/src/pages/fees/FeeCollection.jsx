import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { jsPDF } from 'jspdf';

export default function FeeCollection() {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState(null);

  const handleSearch = async () => {
    if (!studentId) {
      toast.error('Enter Admission Number');
      return;
    }
    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => (s.admission_no || `SS${s.id}`) === studentId);
      
      if (!studentData) {
        toast.error('Student not found');
        setStudent(null);
        return;
      }
      
      setStudent({
        name: (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim(),
        admission_no: studentData.admission_no || `SS${studentData.id}`,
        class: `${studentData.class_name || 'General'} - ${studentData.section || 'A'}`,
        dues: 12500 // Mock dues amount for now
      });
      toast.success('Student found');
    } catch (error) {
      toast.error('Failed to fetch student data');
      setStudent(null);
    }
  };

  const handleCollectAndPrint = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Smart School - Fee Receipt", 105, 30, null, null, "center");
      
      doc.setFontSize(14);
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Student Name: ${student.name}`, 20, 60);
      doc.text(`Admission No: ${student.admission_no}`, 20, 70);
      doc.text(`Class & Section: ${student.class}`, 20, 80);
      doc.text(`Amount Paid: Rs. ${student.dues.toLocaleString()}`, 20, 90);
      doc.text("Payment Mode: Selected Mode", 20, 100);
      
      doc.text("Thank you for your payment.", 20, 120);
      doc.text("Authorized Signature", 140, 140);
      
      doc.save(`Receipt_${student.admission_no}.pdf`);
      toast.success('Payment collected and receipt downloaded!');
      setStudent(null);
      setStudentId('');
    } catch(err) {
      console.error("PDF Error:", err);
      toast.error('Failed to generate receipt');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Fee Collection</h1>
          <p className="subtitle">Collect fees from students</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Search Student by Admission No.</label>
            <div className="flex gap-2">
              <input type="text" className="form-input" placeholder="e.g. SS2025001" value={studentId} onChange={e => setStudentId(e.target.value)} />
              <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>
          </div>
        </div>
      </div>

      {student && (
        <div className="grid-2 animate-slideUp">
          <div className="card">
            <h3 className="text-h4 mb-4">Student Details</h3>
            <div className="mb-2"><span className="text-secondary text-sm">Name:</span> <span className="font-semibold">{student.name}</span></div>
            <div className="mb-2"><span className="text-secondary text-sm">Admission No:</span> {student.admission_no}</div>
            <div className="mb-2"><span className="text-secondary text-sm">Class:</span> {student.class}</div>
            <div className="mt-4 p-4 rounded-md" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-400)' }}>
              <div className="text-sm text-danger mb-1">Total Dues</div>
              <div className="text-h2" style={{ color: 'var(--danger-500)' }}>₹{student.dues.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-h4 mb-4">Collect Payment</h3>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-select">
                <option>Cash</option>
                <option>Online Transfer</option>
                <option>Cheque</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paying</label>
              <input type="number" className="form-input" defaultValue={student.dues} />
            </div>
            <button className="btn btn-success w-full mt-4" onClick={handleCollectAndPrint}>Collect Fees & Print Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}
