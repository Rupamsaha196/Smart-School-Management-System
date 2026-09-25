import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineDocumentCheck, HiOutlinePrinter } from 'react-icons/hi2';
import api from '../../api/axiosInstance';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TransferCertificate() {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState(null);
  const [tcData, setTcData] = useState({
    reason: '',
    conduct: 'Good',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const handleSearch = async () => {
    if (!studentId) {
      toast.error('Enter Admission Number');
      return;
    }
    
    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => (s.admission_no || `SS${s.id}`) === studentId);
      
      if (!studentData) {
        toast.error('Student not found with this Admission Number');
        setStudent(null);
        return;
      }
      
      setStudent({
        name: (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim(),
        admission_no: studentData.admission_no || `SS${studentData.id}`,
        class: `${studentData.class_name || 'General'} - ${studentData.section || 'A'}`,
        dob: studentData.date_of_birth || studentData.dob || 'N/A',
        father_name: studentData.father_name || 'N/A',
        mother_name: studentData.mother_name || 'N/A',
        date_of_joining: studentData.admission_date || 'N/A',
      });
      toast.success('Student found');
    } catch (error) {
      toast.error('Failed to fetch student data');
      setStudent(null);
    }
  };

  const handleGenerateTC = (e) => {
    e.preventDefault();
    if (!tcData.reason) {
      toast.error('Please enter the reason for leaving');
      return;
    }
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text("Smart School", 105, 20, null, null, "center");
      
      doc.setFontSize(16);
      doc.text("Transfer Certificate", 105, 30, null, null, "center");
      
      doc.setFontSize(12);
      doc.text(`Issue Date: ${tcData.issueDate}`, 150, 45);
      
      autoTable(doc, {
        startY: 55,
        theme: 'plain',
        body: [
          ['Admission No:', student.admission_no],
          ['Student Name:', student.name],
          ['Class & Section:', student.class],
          ['Date of Birth:', student.dob],
          ["Father's Name:", student.father_name],
          ["Mother's Name:", student.mother_name],
          ['Date of Joining:', student.date_of_joining],
          ['Reason for Leaving:', tcData.reason],
          ['Conduct:', tcData.conduct],
        ],
        styles: { fontSize: 12, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
        }
      });
      
      doc.text("Principal Signature", 150, doc.lastAutoTable.finalY + 40);
      
      doc.save(`TC_${student.admission_no}.pdf`);
      toast.success('Transfer Certificate Generated as PDF!');
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Transfer Certificate (TC)</h1>
          <p className="subtitle">Generate and manage student transfer certificates</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="form-group" style={{ maxWidth: '500px' }}>
          <label className="form-label">Search Student by Admission No.</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. SS2025002" 
              value={studentId} 
              onChange={e => setStudentId(e.target.value)} 
            />
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      {student && (
        <div className="grid-2 animate-slideUp">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Student Details</span>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div><span className="text-secondary text-sm">Name:</span> <span className="font-semibold">{student.name}</span></div>
              <div><span className="text-secondary text-sm">Admission No:</span> {student.admission_no}</div>
              <div><span className="text-secondary text-sm">Class:</span> {student.class}</div>
              <div><span className="text-secondary text-sm">Date of Birth:</span> {student.dob}</div>
              <div><span className="text-secondary text-sm">Father's Name:</span> {student.father_name}</div>
              <div><span className="text-secondary text-sm">Mother's Name:</span> {student.mother_name}</div>
              <div><span className="text-secondary text-sm">Date of Joining:</span> {student.date_of_joining}</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <span className="card-title">TC Details</span>
            </div>
            <form onSubmit={handleGenerateTC} className="mt-4 flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Reason for Leaving <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Relocating to another city" 
                  value={tcData.reason}
                  onChange={e => setTcData({...tcData, reason: e.target.value})}
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Conduct / Behavior</label>
                <select 
                  className="form-select"
                  value={tcData.conduct}
                  onChange={e => setTcData({...tcData, conduct: e.target.value})}
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Satisfactory</option>
                  <option>Poor</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Issue Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={tcData.issueDate}
                  onChange={e => setTcData({...tcData, issueDate: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn btn-success flex-1">
                  <HiOutlineDocumentCheck size={18} /> Generate TC
                </button>
                <button type="button" className="btn btn-ghost border border-[var(--border-secondary)]">
                  <HiOutlinePrinter size={18} /> Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
