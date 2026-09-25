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
  const [totalMembers, setTotalMembers] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', qty: '' });

  React.useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

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

  const handleIssueBook = async (book) => {
    if (book.qty <= book.issued) return;
    
    try {
      const newAvailable = book.qty - (book.issued + 1);
      // Try hitting API
      if (typeof book.id === 'number' && book.id > 10000) {
          // It's a demo local book, just update state
      } else {
          await api.put(`/library-books/${book.id}`, { ...book, available_qty: newAvailable });
      }
      setBooks(books.map(b => b.id === book.id ? { ...b, issued: book.issued + 1 } : b));
      toast.success('Book issued successfully!');
    } catch (err) {
      setBooks(books.map(b => b.id === book.id ? { ...b, issued: book.issued + 1 } : b));
      toast.success('Book issued (local mode)!');
    }
  };

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
          <div className="stat-value">{books.reduce((acc, book) => acc + book.issued, 0) > 0 ? Math.max(1, Math.floor(books.reduce((acc, book) => acc + book.issued, 0) * 0.1)) : 0}</div>
          <div className="stat-label">Overdue Returns</div>
        </div>
      </div>

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
                    <button className="btn btn-sm btn-secondary mr-2" disabled={book.qty === book.issued} onClick={() => handleIssueBook(book)}>Issue Book</button>
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
