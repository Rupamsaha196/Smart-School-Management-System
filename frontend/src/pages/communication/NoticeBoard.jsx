import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMegaphone } from 'react-icons/hi2';

const demoNotices = [
  { id: 1, title: 'Annual Sports Day', date: '2026-10-15', audience: 'All', content: 'Annual sports day will be held on Oct 15th.' },
  { id: 2, title: 'Fee Submit Last Date', date: '2026-09-30', audience: 'Parents', content: 'Please submit 2nd quarter fee before 30th Sep.' },
];

export default function NoticeBoard() {
  const [notices, setNotices] = useState(demoNotices);
  const [showForm, setShowForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', date: '', audience: 'All', content: '' });

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    setNotices([{ 
      id: Date.now(), 
      ...newNotice, 
      date: newNotice.date || new Date().toISOString().split('T')[0] 
    }, ...notices]);
    
    setShowForm(false);
    setNewNotice({ title: '', date: '', audience: 'All', content: '' });
    toast.success('Notice published successfully!');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Notice Board</h1>
          <p className="subtitle">School announcements and circulars</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : 'Add Notice'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Create New Notice</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddNotice}>
            <div className="form-group mb-0">
              <label>Title</label>
              <input type="text" className="form-input" placeholder="e.g. Annual Sports Day" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Audience</label>
              <select className="form-select" value={newNotice.audience} onChange={e => setNewNotice({...newNotice, audience: e.target.value})}>
                <option>All</option>
                <option>Students</option>
                <option>Parents</option>
                <option>Teachers</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Date (Optional)</label>
              <input type="date" className="form-input" value={newNotice.date} onChange={e => setNewNotice({...newNotice, date: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label>Notice Content</label>
              <textarea className="form-input" placeholder="Write notice details here..." rows="3" value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} required></textarea>
            </div>
            <div className="form-group flex items-end mb-0" style={{ gridColumn: 'span 3', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Publish Notice</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-2">
        {notices.map(notice => (
          <div className="card" key={notice.id}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-h4 flex items-center gap-2"><HiOutlineMegaphone className="text-primary-400" /> {notice.title}</h3>
              <span className="badge badge-info">{notice.audience}</span>
            </div>
            <p className="text-xs text-tertiary mb-3">Published: {notice.date}</p>
            <p className="text-sm">{notice.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
