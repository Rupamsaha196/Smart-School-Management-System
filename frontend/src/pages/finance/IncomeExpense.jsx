import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import { HiOutlinePlus, HiOutlineArrowDownTray, HiOutlineArrowUpTray } from 'react-icons/hi2';

export default function IncomeExpense() {
  const [activeTab, setActiveTab] = useState('income');
  const [showForm, setShowForm] = useState(false);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [newRecord, setNewRecord] = useState({ head: '', name: '', date: '', amount: '', ref: '' });

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      
      const income = data
        .filter(t => t.type === 'Income')
        .map(t => ({ id: t.id, head: t.head, name: t.description || 'Unknown', date: t.date, amount: t.amount, receipt: `INC-${t.id}` }));
        
      const expense = data
        .filter(t => t.type === 'Expense')
        .map(t => ({ id: t.id, head: t.head, name: t.description || 'Unknown', date: t.date, amount: t.amount, invoice: `EXP-${t.id}` }));
        
      setIncomeData(income);
      setExpenseData(expense);
    } catch (err) {
      console.error('Failed to load transactions');
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRecord.head || !newRecord.amount || !newRecord.date) return;
    
    if (activeTab === 'income') {
      setIncomeData([{ 
        id: Date.now(), 
        ...newRecord, 
        amount: Number(newRecord.amount),
        receipt: newRecord.ref || `INC-${Date.now().toString().slice(-4)}`
      }, ...incomeData]);
    } else {
      setExpenseData([{ 
        id: Date.now(), 
        ...newRecord, 
        amount: Number(newRecord.amount),
        invoice: newRecord.ref || `EXP-${Date.now().toString().slice(-4)}`
      }, ...expenseData]);
    }
    
    setShowForm(false);
    setNewRecord({ head: '', name: '', date: '', amount: '', ref: '' });
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Income & Expenses</h1>
          <p className="subtitle">Manage school non-fee income and administrative expenses</p>
        </div>
        <button 
          className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-danger'}`}
          onClick={() => setShowForm(!showForm)}
        >
          <HiOutlinePlus size={18} /> {showForm ? 'Cancel' : `Add ${activeTab === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => toggleTab('income')}>
          <HiOutlineArrowDownTray className="inline mr-2" /> Income Records
        </button>
        <button className={`tab ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => toggleTab('expense')}>
          <HiOutlineArrowUpTray className="inline mr-2" /> Expense Records
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Add New {activeTab === 'income' ? 'Income' : 'Expense'}</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddSubmit}>
            <div className="form-group mb-0">
              <label>Head</label>
              <input type="text" className="form-input" placeholder="e.g. Maintenance" value={newRecord.head} onChange={e => setNewRecord({...newRecord, head: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Name / Source</label>
              <input type="text" className="form-input" placeholder="e.g. John Doe" value={newRecord.name} onChange={e => setNewRecord({...newRecord, name: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Date</label>
              <input type="date" className="form-input" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Amount (₹)</label>
              <input type="number" className="form-input" placeholder="0" value={newRecord.amount} onChange={e => setNewRecord({...newRecord, amount: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>{activeTab === 'income' ? 'Receipt No (Optional)' : 'Invoice No (Optional)'}</label>
              <input type="text" className="form-input" placeholder="Auto-generated if empty" value={newRecord.ref} onChange={e => setNewRecord({...newRecord, ref: e.target.value})} />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-danger'} w-full`} style={{ height: '42px' }}>
                Save {activeTab === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card animate-slideUp">
        {activeTab === 'income' && (
          <div className="table-container">
            <div className="table-toolbar">
              <span className="card-title">Income Transactions</span>
              <div className="table-search">
                <input type="text" placeholder="Search income..." />
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Income Head</th>
                  <th>Name / Source</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map(item => (
                  <tr key={item.id}>
                    <td>{item.receipt}</td>
                    <td>{item.head}</td>
                    <td>{item.name}</td>
                    <td>{item.date}</td>
                    <td className="text-success font-semibold">₹{item.amount.toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-ghost text-primary-400">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="table-container">
            <div className="table-toolbar">
              <span className="card-title">Expense Transactions</span>
              <div className="table-search">
                <input type="text" placeholder="Search expenses..." />
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Expense Head</th>
                  <th>Payee / Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map(item => (
                  <tr key={item.id}>
                    <td>{item.invoice}</td>
                    <td>{item.head}</td>
                    <td>{item.name}</td>
                    <td>{item.date}</td>
                    <td className="text-danger font-semibold">₹{item.amount.toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-ghost text-primary-400">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
