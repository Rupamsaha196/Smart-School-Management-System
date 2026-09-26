import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineDocumentCheck, HiOutlinePrinter } from 'react-icons/hi2';
import api from '../../api/axiosInstance';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TransferCertificate() {
  const location = useLocation();
  const [studentId, setStudentId] = useState(location.state?.admissionNo || '');
  const [student, setStudent] = useState(null);
  const [tcData, setTcData] = useState({
    reason: '',
    conduct: 'Good',
    issueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (location.state?.admissionNo) {
      searchByTerm(location.state.admissionNo);
    }
  }, [location.state]);

  const searchByTerm = async (queryTerm) => {
    const term = (queryTerm || '').trim().toLowerCase();
    if (!term) return;

    try {
      const { data } = await api.get('/students');
      const studentData = data.find(s => {
        const adm = (s.admission_no || `SS${s.id}`).trim().toLowerCase();
        const name = (s.name || `${s.first_name || ''} ${s.last_name || ''}`).trim().toLowerCase();
        return adm === term || adm.includes(term) || name.includes(term);
      });
      
      if (!studentData) {
        toast.error('Student not found');
        setStudent(null);
        return;
      }
      
      setStudent({
        id: studentData.id,
        name: (studentData.name || `${studentData.first_name || ''} ${studentData.last_name || ''}`).trim(),
        admission_no: studentData.admission_no || `SS${studentData.id}`,
        class: `${studentData.class_name || 'General'} - ${studentData.section || 'A'}`,
        dob: studentData.date_of_birth || studentData.dob || 'N/A',
        father_name: studentData.father_name || 'N/A',
        mother_name: studentData.mother_name || 'N/A',
        date_of_joining: studentData.admission_date || 'N/A',
      });
    } catch (error) {
      toast.error('Failed to fetch student data');
    }
  };

  const handleSearch = () => {
    if (!studentId.trim()) {
      toast.error('Enter Admission Number or Student Name');
      return;
    }
    searchByTerm(studentId);
  };

  const generatePdfDoc = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SMART SCHOOL", 105, 14, null, null, "center");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("CBSE Affiliation No. 123456 | Accredited Excellence in Education", 105, 22, null, null, "center");
    
    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSFER CERTIFICATE", 105, 42, null, null, "center");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`TC No: TC/${new Date().getFullYear()}/${student.admission_no}`, 20, 52);
    doc.text(`Issue Date: ${tcData.issueDate}`, 155, 52);
    
    autoTable(doc, {
      startY: 58,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      body: [
        ['Admission No / Scholar No:', student.admission_no],
        ['Student Full Name:', student.name],
        ['Class & Section Left:', student.class],
        ['Date of Birth (in Christian Era):', student.dob],
        ["Father's / Guardian's Name:", student.father_name],
        ["Mother's Name:", student.mother_name],
        ['Date of Admission to School:', student.date_of_joining],
        ['Reason for Leaving School:', tcData.reason || 'On Parent Request'],
        ['General Conduct / Character:', tcData.conduct || 'Good'],
        ['School / Board Dues:', 'Cleared in Full'],
        ['Remarks:', 'Student is relieved with best wishes for future studies.'],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70, fillColor: [248, 250, 252] },
        1: { cellWidth: 110 },
      }
    });
    
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 170;
    
    doc.setFontSize(10);
    doc.text("Class Teacher", 30, finalY + 35);
    doc.text("Verified By", 105, finalY + 35, null, null, "center");
    doc.text("Principal (Seal & Signature)", 150, finalY + 35);
    
    return doc;
  };

  const handleGenerateTC = (e) => {
    e.preventDefault();
    if (!tcData.reason) {
      toast.error('Please enter the reason for leaving');
      return;
    }
    
    try {
      const doc = generatePdfDoc();
      doc.save(`TC_${student.admission_no}.pdf`);
      toast.success('Transfer Certificate downloaded as PDF!');
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrintTC = () => {
    try {
      const doc = generatePdfDoc();
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } catch (err) {
      console.error("Print Error:", err);
      toast.error('Failed to open print preview');
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
              
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn btn-success flex-1" style={{ height: '42px' }}>
                  <HiOutlineDocumentCheck size={18} /> Download TC (PDF)
                </button>
                <button type="button" className="btn btn-secondary" style={{ height: '42px' }} onClick={handlePrintTC}>
                  <HiOutlinePrinter size={18} /> Print Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
