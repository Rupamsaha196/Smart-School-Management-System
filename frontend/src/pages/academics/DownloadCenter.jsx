import { useState } from 'react';
import { HiOutlineDocumentArrowDown, HiOutlineMagnifyingGlass, HiOutlineCloudArrowUp } from 'react-icons/hi2';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const documents = [
  { id: 1, title: 'Mathematics Syllabus 2025-26', type: 'Syllabus', class: 'Class 10', date: '2025-09-01', size: '1.2 MB' },
  { id: 2, physics: 'Physics Chapter 4 Notes', type: 'Study Material', class: 'Class 12', date: '2025-09-15', size: '3.4 MB' },
  { id: 3, title: 'Holiday Assignment - English', type: 'Assignment', class: 'Class 8', date: '2025-09-20', size: '850 KB' },
  { id: 4, title: 'Annual Exam Timetable', type: 'Other', class: 'All Classes', date: '2025-09-22', size: '400 KB' },
];

export default function DownloadCenter() {
  const [activeTab, setActiveTab] = useState('All');

  const handleDownload = (docData) => {
    try {
      const doc = new jsPDF();
      const title = docData.title || docData.physics;
      doc.setFontSize(22);
      doc.text(title, 105, 30, null, null, "center");
      doc.setFontSize(14);
      doc.text(`Type: ${docData.type}`, 20, 50);
      doc.text(`Class: ${docData.class}`, 20, 60);
      doc.text(`Date: ${docData.date}`, 20, 70);
      doc.text("This is a downloaded document from Smart School Download Center.", 20, 90);
      
      const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${fileName}.pdf`);
      toast.success('File downloaded successfully!');
    } catch(err) {
      console.error("PDF Download Error:", err);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Download Center</h1>
          <p className="subtitle">Manage syllabus, assignments, and study materials</p>
        </div>
        <button className="btn btn-primary"><HiOutlineCloudArrowUp size={18}/> Upload Content</button>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <div className="tabs mb-0 border-b-0">
            {['All', 'Syllabus', 'Assignments', 'Study Material', 'Other'].map(tab => (
              <button 
                key={tab} 
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="table-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input type="text" placeholder="Search files..." />
          </div>
        </div>
        <div className="table-container border-t-0 rounded-t-none">
          <table>
            <thead>
              <tr>
                <th>Content Title</th>
                <th>Type</th>
                <th>Available For</th>
                <th>Upload Date</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="font-semibold text-primary-400">{doc.title || doc.physics}</td>
                  <td><span className="badge badge-info">{doc.type}</span></td>
                  <td>{doc.class}</td>
                  <td>{doc.date}</td>
                  <td className="text-secondary">{doc.size}</td>
                  <td>
                    <button onClick={() => handleDownload(doc)} className="btn btn-sm btn-ghost text-success"><HiOutlineDocumentArrowDown size={18}/> Download</button>
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
