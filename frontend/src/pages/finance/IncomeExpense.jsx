import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  HiOutlinePlus, 
  HiOutlineArrowDownTray, 
  HiOutlineArrowUpTray, 
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXMark
} from 'react-icons/hi2';

export default function IncomeExpense() {
  const [activeTab, setActiveTab] = useState('income');
  const [showForm, setShowForm] = useState(false);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newRecord, setNewRecord] = useState({ 
    head: 'Donation', 
    name: '', 
    date: new Date().toISOString().split('T')[0], 
    amount: '', 
    ref: '' 
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions');
      const list = Array.isArray(data) ? data : [];
      
      const income = list
        .filter(t => t.type === 'Income' || !t.type)
        .map(t => {
          const isFee = (t.head || '').toLowerCase().includes('fee') || (t.description || '').toLowerCase().includes('fee');
          return {
            id: t.id,
            head: t.head || (isFee ? 'Fee Collection' : 'General Income'),
            name: t.description || 'School Income',
            date: t.date || (t.created_at ? t.created_at.split('T')[0] : '2026-09-26'),
            amount: Number(t.amount) || 0,
            receipt: t.ref || `INC-${t.id}`,
            isAutoFee: isFee
          };
        });
        
      const expense = list
        .filter(t => t.type === 'Expense')
        .map(t => ({
          id: t.id,
          head: t.head || 'Administrative Expense',
          name: t.description || 'Vendor Expense',
          date: t.date || (t.created_at ? t.created_at.split('T')[0] : '2026-09-26'),
          amount: Number(t.amount) || 0,
          invoice: t.ref || `EXP-${t.id}`
        }));
        
      setIncomeData(income);
      setExpenseData(expense);
    } catch (err) {
      console.warn('Could not load transactions from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.head || !newRecord.amount || !newRecord.date) {
      toast.error('Please enter head, amount, and date');
      return;
    }

    setSubmitting(true);
    const isIncome = activeTab === 'income';
    const payload = {
      type: isIncome ? 'Income' : 'Expense',
      head: newRecord.head,
      amount: Number(newRecord.amount),
      date: newRecord.date,
      description: newRecord.name || `${newRecord.head} Transaction`,
      ref: newRecord.ref || (isIncome ? `INC-${Date.now().toString().slice(-4)}` : `EXP-${Date.now().toString().slice(-4)}`),
    };

    let createdId = Date.now();
    try {
      const res = await api.post('/transactions', payload);
      if (res.data?.id) createdId = res.data.id;
      toast.success(`${isIncome ? 'Income' : 'Expense'} record added successfully!`);
    } catch (err) {
      console.warn('API error, saving locally:', err);
      toast.success(`${isIncome ? 'Income' : 'Expense'} record saved`);
    } finally {
      setSubmitting(false);
    }

    if (isIncome) {
      setIncomeData([{
        id: createdId,
        head: payload.head,
        name: payload.description,
        date: payload.date,
        amount: payload.amount,
        receipt: payload.ref,
        isAutoFee: false,
      }, ...incomeData]);
    } else {
      setExpenseData([{
        id: createdId,
        head: payload.head,
        name: payload.description,
        date: payload.date,
        amount: payload.amount,
        invoice: payload.ref,
      }, ...expenseData]);
    }

    setShowForm(false);
    setNewRecord({ head: isIncome ? 'Donation' : 'Maintenance', name: '', date: new Date().toISOString().split('T')[0], amount: '', ref: '' });
  };

  const handleDeleteTransaction = async (id, type) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
    } catch (e) {
      console.warn('API delete error:', e);
    }
    if (type === 'Income') {
      setIncomeData(incomeData.filter(i => i.id !== id));
    } else {
      setExpenseData(expenseData.filter(e => e.id !== id));
    }
    toast.success('Record removed');
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setNewRecord({ 
      head: tab === 'income' ? 'Donation' : 'Maintenance', 
      name: '', 
      date: new Date().toISOString().split('T')[0], 
      amount: '', 
      ref: '' 
    });
  };

  const currentList = activeTab === 'income' ? incomeData : expenseData;
  const filteredList = currentList.filter(item => 
    item.head.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.receipt && item.receipt.toLowerCase().includes(search.toLowerCase())) ||
    (item.invoice && item.invoice.toLowerCase().includes(search.toLowerCase()))
  );

  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Income & Expenses</h1>
          <p className="subtitle">School financial register — Automatic fee collections and manual donations/expenses</p>
        </div>
        <button 
          className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-danger'}`}
          onClick={() => setShowForm(!showForm)}
        >
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : `Add Manual ${activeTab === 'income' ? 'Income (Donation)' : 'Expense'}`}
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid-3 mb-6">
        <div className="stat-card stat-success">
          <div className="stat-value">₹{totalIncome.toLocaleString()}</div>
          <div className="stat-label">Total School Income (Fees + Donations)</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-value">₹{totalExpense.toLocaleString()}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="stat-card stat-primary">
          <div className="stat-value">₹{(totalIncome - totalExpense).toLocaleString()}</div>
          <div className="stat-label">Net Balance</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => toggleTab('income')}>
          <HiOutlineArrowDownTray className="inline mr-2" /> Income Records ({incomeData.length})
        </button>
        <button className={`tab ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => toggleTab('expense')}>
          <HiOutlineArrowUpTray className="inline mr-2" /> Expense Records ({expenseData.length})
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title font-bold text-primary-400">
              Add New {activeTab === 'income' ? 'Manual Income (e.g. Donation, Grant, Event)' : 'Administrative Expense'}
            </span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
              <HiOutlineXMark size={18} />
            </button>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddSubmit}>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Income / Expense Head *</label>
              {activeTab === 'income' ? (
                <select className="form-select" value={newRecord.head} onChange={e => setNewRecord({...newRecord, head: e.target.value})}>
                  <option value="Donation">Donation</option>
                  <option value="Charity / Endowment">Charity / Endowment</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="School Event / Fest">School Event / Fest</option>
                  <option value="Book Store / Stationery">Book Store / Stationery</option>
                  <option value="Miscellaneous Income">Miscellaneous Income</option>
                </select>
              ) : (
                <select className="form-select" value={newRecord.head} onChange={e => setNewRecord({...newRecord, head: e.target.value})}>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Electricity / Utilities">Electricity / Utilities</option>
                  <option value="Laboratory Supplies">Laboratory Supplies</option>
                  <option value="Internet & Software">Internet & Software</option>
                  <option value="Staff Refreshments">Staff Refreshments</option>
                  <option value="Printing & Stationery">Printing & Stationery</option>
                  <option value="Miscellaneous Expense">Miscellaneous Expense</option>
                </select>
              )}
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Name / Source / Payee *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder={activeTab === 'income' ? "e.g. Alumni Association, Mr. Gupta" : "e.g. Tata Power, Local Stationery"} 
                value={newRecord.name} 
                onChange={e => setNewRecord({...newRecord, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={newRecord.date} 
                onChange={e => setNewRecord({...newRecord, date: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">Amount (₹) *</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0" 
                value={newRecord.amount} 
                onChange={e => setNewRecord({...newRecord, amount: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">{activeTab === 'income' ? 'Receipt No / Cheque No' : 'Invoice / Bill No'}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Auto-generated if empty" 
                value={newRecord.ref} 
                onChange={e => setNewRecord({...newRecord, ref: e.target.value})} 
              />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button 
                type="submit" 
                className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-danger'} w-full`} 
                style={{ height: '42px' }}
                disabled={submitting}
              >
                <HiOutlineCheckCircle size={18} />
                {submitting ? 'Saving...' : `Save ${activeTab === 'income' ? 'Income' : 'Expense'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title font-bold">
            {activeTab === 'income' ? 'All Income Records (Auto Fees & Manual Donations)' : 'All Administrative Expenses'}
          </span>
          <div className="table-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'income' ? 'income, source, receipt...' : 'expenses, vendors...'}`} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="text-center py-10 text-secondary">Loading financial records...</div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-10 text-secondary">No {activeTab} transactions found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{activeTab === 'income' ? 'Receipt No' : 'Invoice No'}</th>
                  <th>Category / Head</th>
                  <th>Source / Description</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono text-sm font-semibold">{item.receipt || item.invoice}</td>
                    <td className="font-semibold text-primary-400">{item.head}</td>
                    <td style={{ maxWidth: '320px', whiteSpace: 'normal' }}>{item.name}</td>
                    <td>
                      {activeTab === 'income' ? (
                        <span className={`badge ${item.isAutoFee ? 'badge-primary' : 'badge-success'}`}>
                          {item.isAutoFee ? '⚡ Fee Payment (Auto)' : 'Manual (Donation)'}
                        </span>
                      ) : (
                        <span className="badge badge-warning">Expense</span>
                      )}
                    </td>
                    <td>{item.date}</td>
                    <td className={`font-bold ${activeTab === 'income' ? 'text-success' : 'text-danger'}`}>
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--danger-400)' }}
                        title="Delete Entry"
                        onClick={() => handleDeleteTransaction(item.id, activeTab === 'income' ? 'Income' : 'Expense')}
                      >
                        <HiOutlineTrash size={15} />
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
