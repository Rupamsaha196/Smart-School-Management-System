import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

const demoData = [
  { name: 'Class 1', present: 95, absent: 5 },
  { name: 'Class 2', present: 92, absent: 8 },
  { name: 'Class 3', present: 88, absent: 12 },
  { name: 'Class 4', present: 97, absent: 3 },
  { name: 'Class 5', present: 90, absent: 10 },
];

export default function AttendanceReport() {
  const [month, setMonth] = useState('09');
  const [year, setYear] = useState('2026');

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Attendance Report</h1>
          <p className="subtitle">View attendance analytics and generate reports</p>
        </div>
        <button className="btn btn-secondary"><HiOutlineDocumentArrowDown size={18} /> Export PDF</button>
      </div>

      <div className="card mb-6">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Month</label>
            <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary w-full">Generate Report</button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Class-wise Attendance %</span></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1a2342',
                  border: '1px solid rgba(148,163,184,0.12)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Top Defaulters (Below 75%)</span></div>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Rohan Patel</td><td>Class 3 - A</td><td className="text-danger">68%</td></tr>
                <tr><td>Ananya Gupta</td><td>Class 5 - B</td><td className="text-danger">71%</td></tr>
                <tr><td>Vikram Reddy</td><td>Class 8 - A</td><td className="text-danger">74%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
