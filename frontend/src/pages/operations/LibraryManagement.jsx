import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlinePlus } from 'react-icons/hi2';

const initialBooks = [
  { id: 1, title: 'Introduction to Physics', author: 'John Cutnell', isbn: '978-1-118-48689-4', qty: 15, issued: 12 },
  { id: 2, title: 'Advanced Mathematics', author: 'Richard Courant', isbn: '978-3-540-67825-3', qty: 10, issued: 3 },
  { id: 3, title: 'World History', author: 'William McNeill', isbn: '978-0-19-511616-8', qty: 8, issued: 8 },
];

export default function LibraryManagement() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Issue Modal State
  const [issueModal, setIssueModal] = useState({ show: false, book: null });
  const [issueForm, setIssueForm] = useState({ student_name: '', due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] });

  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', qty: '' });

  React.useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data } = await api.get('/book-issues');
      if (Array.isArray(data)) setIssues(data);
    } catch (err) {
      console.warn('Failed to load issues');
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/students');
      if (Array.isArray(data) && data.length > 0) {
        setTotalMembers(data.length);
      } else {
        const local = localStorage.getItem('local_students');
        setTotalMembers(local ? JSON.parse(local).length : 0);
      }
    } catch (err) {
      const local = localStorage.getItem('local_students');
      setTotalMembers(local ? JSON.parse(local).length : 0);
    }
  };

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/library-books');
      const formatted = data.map(b => ({
        ...b,
        issued: b.qty - b.available_qty // calculate issued based on qty and available_qty
      }));
      setBooks(formatted);
    } catch (err) {
      console.error('Failed to load books');
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    try {
      if (editingId) {
        await api.put(`/library-books/${editingId}`, { ...newBook, qty: Number(newBook.qty) || 1 });
        setBooks(books.map(b => b.id === editingId ? { ...b, ...newBook, qty: Number(newBook.qty) || 1 } : b));
      } else {
        const payload = { ...newBook, qty: Number(newBook.qty) || 1, available_qty: Number(newBook.qty) || 1 };
        const response = await api.post('/library-books', payload);
        const savedBook = response.data || { id: Date.now(), ...payload, issued: 0 };
        setBooks([{ ...savedBook, issued: 0 }, ...books]);
      }
      setShowForm(false);
      setEditingId(null);
      setNewBook({ title: '', author: '', isbn: '', qty: '' });
    } catch (error) {
      console.error('Failed to save book:', error);
      // Fallback for demo mode
      if (editingId) {
        setBooks(books.map(b => b.id === editingId ? { ...b, ...newBook, qty: Number(newBook.qty) || 1 } : b));
      } else {
        setBooks([{ id: Date.now(), ...newBook, qty: Number(newBook.qty) || 1, issued: 0 }, ...books]);
      }
      setShowForm(false);
      setEditingId(null);
      setNewBook({ title: '', author: '', isbn: '', qty: '' });
    }
  };

  const handleEditClick = (book) => {
    setNewBook({ title: book.title, author: book.author, isbn: book.isbn, qty: book.qty });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueModal.book || !issueForm.student_name) return;
    
    const book = issueModal.book;
    try {
      const newAvailable = book.qty - (book.issued + 1);
      
      // 1. Create Issue Record
      const issuePayload = {
        book_id: book.id,
        student_name: issueForm.student_name,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: issueForm.due_date,
        status: 'issued'
      };
      
      let newIssue = { id: Date.now(), ...issuePayload };
      if (typeof book.id !== 'number' || book.id < 10000) {
        const { data } = await api.post('/book-issues', issuePayload);
        newIssue = data;
      }
      
      // 2. Update Book
      if (typeof book.id !== 'number' || book.id < 10000) {
        await api.put(`/library-books/${book.id}`, { ...book, available_qty: newAvailable, issued: book.issued + 1 });
      }
      
      setBooks(books.map(b => b.id === book.id ? { ...b, issued: book.issued + 1, available_qty: newAvailable } : b));
      setIssues([newIssue, ...issues]);
      toast.success('Book issued successfully to ' + issueForm.student_name);
      setIssueModal({ show: false, book: null });
      setIssueForm({ student_name: '', due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] });
    } catch (err) {
      toast.error('Failed to issue book');
    }
  };

  const overdueCount = issues.filter(i => i.status === 'issued' && new Date(i.due_date) < new Date()).length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Library Management</h1>
          <p className="subtitle">Manage books, members, issues, and returns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">{editingId ? 'Edit Book' : 'Add New Book'}</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleSaveBook}>
            <div className="form-group mb-0">
              <label>Book Title</label>
              <input type="text" className="form-input" placeholder="e.g. The Great Gatsby" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Author</label>
              <input type="text" className="form-input" placeholder="e.g. F. Scott Fitzgerald" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>ISBN Number</label>
              <input type="text" className="form-input" placeholder="e.g. 978-0-7432-7356-5" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Quantity</label>
              <input type="number" className="form-input" placeholder="1" value={newBook.qty} onChange={e => setNewBook({...newBook, qty: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4" style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                {editingId ? 'Update Book' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-4 mb-6">
        <div className="stat-card stat-info">
          <div className="stat-value">{books.reduce((acc, book) => acc + book.qty, 0)}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{books.reduce((acc, book) => acc + book.issued, 0)}</div>
          <div className="stat-label">Books Issued</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-label">Active Members</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">Overdue Returns</div>
        </div>
      </div>

      {issueModal.show && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-slideUp" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header">
              <span className="card-title">Issue Book</span>
            </div>
            <form className="p-4" onSubmit={handleIssueSubmit}>
              <div className="form-group mb-4">
                <label className="form-label">Book</label>
                <input type="text" className="form-input" value={issueModal.book?.title} disabled />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Student Name</label>
                <input type="text" className="form-input" placeholder="e.g. Aarav Sharma" value={issueForm.student_name} onChange={e => setIssueForm({...issueForm, student_name: e.target.value})} required />
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={issueForm.due_date} onChange={e => setIssueForm({...issueForm, due_date: e.target.value})} required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setIssueModal({ show: false, book: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Issue Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineBookOpen/> Book Inventory</span>
          <div className="table-search">
            <input type="text" placeholder="Search by title, author, or ISBN..." />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>ISBN Number</th>
                <th>Qty</th>
                <th>Issued</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td className="font-semibold text-primary-400">{book.title}</td>
                  <td>{book.author}</td>
                  <td className="text-sm font-mono text-tertiary">{book.isbn}</td>
                  <td>{book.qty}</td>
                  <td className="text-warning font-semibold">{book.issued}</td>
                  <td>
                    <span className={`badge ${book.qty - book.issued > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {book.qty - book.issued}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary mr-2" disabled={book.qty <= book.issued} onClick={() => setIssueModal({ show: true, book })}>Issue Book</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleEditClick(book)}>Edit</button>
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
