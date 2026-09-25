import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axiosInstance';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineVideoCamera,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlinePlay
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';

const attendanceData = [
  { day: 'Mon', present: 92, absent: 8 },
  { day: 'Tue', present: 88, absent: 12 },
  { day: 'Wed', present: 95, absent: 5 },
  { day: 'Thu', present: 90, absent: 10 },
  { day: 'Fri', present: 87, absent: 13 },
];

const feeData = [
  { month: 'Apr', collected: 85000, pending: 15000 },
  { month: 'May', collected: 92000, pending: 12000 },
  { month: 'Jun', collected: 78000, pending: 22000 },
  { month: 'Jul', collected: 95000, pending: 8000 },
  { month: 'Aug', collected: 88000, pending: 14000 },
  { month: 'Sep', collected: 91000, pending: 11000 },
];

const classDistribution = [
  { name: 'Class 1-5', value: 320, color: '#6366f1' },
  { name: 'Class 6-8', value: 280, color: '#06b6d4' },
  { name: 'Class 9-10', value: 210, color: '#10b981' },
  { name: 'Class 11-12', value: 140, color: '#f59e0b' },
];

const recentActivities = [
  { id: 1, text: 'New admission: Aarav Sharma (Class 5-A)', time: '2 mins ago', type: 'success' },
  { id: 2, text: 'Fee payment received: ₹12,500 from Priya Singh', time: '15 mins ago', type: 'info' },
  { id: 3, text: 'Attendance alert: Class 8-B has 20% absence', time: '1 hour ago', type: 'warning' },
];

const liveClasses = [
  { id: 1, subject: 'Mathematics (Class 10)', teacher: 'Mr. Sharma', time: '10:00 AM - 11:00 AM', status: 'Live', url: '#' },
  { id: 2, subject: 'Physics (Class 12)', teacher: 'Mrs. Verma', time: '11:30 AM - 12:30 PM', status: 'Upcoming', url: '#' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'parent' || user?.role === 'student') {
    return <ParentDashboard user={user} />;
  }
  if (user?.role === 'teacher') {
    return <TeacherDashboard user={user} />;
  }
  return <AdminDashboard user={user} />;
}

function ParentDashboard({ user }) {
  const childName = user?.role === 'parent' ? "Aarav's" : "Your";
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>My Dashboard</h1>
          <p className="subtitle">Welcome back, {user?.name}! Here is {childName} academic overview.</p>
        </div>
      </div>

      {/* Parent/Student Stat Cards */}
      <div className="grid-stats mb-6">
        <div className="stat-card stat-primary animate-slideUp">
          <div className="stat-icon"><HiOutlineCheckCircle size={22} /></div>
          <div className="stat-value">94.5%</div>
          <div className="stat-label">Total Attendance</div>
          <span className="stat-change positive"><HiOutlineArrowTrendingUp size={12} /> Good standing</span>
        </div>
        <div className="stat-card stat-warning animate-slideUp" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon"><HiOutlineBanknotes size={22} /></div>
          <div className="stat-value">₹4,500</div>
          <div className="stat-label">Pending Fees</div>
          <span className="stat-change negative">Due in 5 days</span>
        </div>
        <div className="stat-card stat-info animate-slideUp" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon"><HiOutlineAcademicCap size={22} /></div>
          <div className="stat-value">A+</div>
          <div className="stat-label">Latest Exam Grade</div>
          <span className="stat-change positive">Mid-term 2025</span>
        </div>
        <div className="stat-card stat-success animate-slideUp" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon"><HiOutlineBookOpen size={22} /></div>
          <div className="stat-value">6</div>
          <div className="stat-label">Assignments Due</div>
          <span className="stat-change negative">2 overdue</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Live Classes</span>
          </div>
          <div className="flex flex-col gap-4">
            {liveClasses.map(cls => (
              <div key={cls.id} className="p-4 rounded-lg flex items-center justify-between" style={{ background: 'var(--bg-input)' }}>
                <div className="flex items-center gap-3">
                  <div className={`avatar-sm flex items-center justify-center rounded-full text-white ${cls.status === 'Live' ? 'bg-danger-500 animate-pulse' : 'bg-primary-500'}`}>
                    <HiOutlineVideoCamera />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>{cls.subject}</p>
                    <p className="text-xs text-secondary">{cls.teacher} • {cls.time}</p>
                  </div>
                </div>
                <button className={`btn btn-sm ${cls.status === 'Live' ? 'btn-danger' : 'btn-primary'}`}>
                  {cls.status === 'Live' ? 'Join Now' : 'Remind Me'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Notices</span>
          </div>
          <div className="activity-feed">
             <div className="activity-item" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <p className="text-sm">School closed on Friday for state holiday.</p>
                <p className="text-xs text-tertiary mt-1">2 hours ago</p>
             </div>
             <div className="activity-item" style={{ padding: '12px 0' }}>
                <p className="text-sm">Science fair project submission deadline extended.</p>
                <p className="text-xs text-tertiary mt-1">1 day ago</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    feesCollected: '₹0',
    attendance: '0%',
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Assuming api from axiosInstance is available in this file. Wait, we need to import api and React.
      // Actually let's import it at the top of the file.
      const { data } = await api.get('/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back, {user?.name || 'Admin'}! Here's your school overview.</p>
        </div>
        <div className="flex gap-3">
          <select className="form-select" style={{ width: 'auto', minWidth: 160 }}>
            <option>2025-2026</option>
            <option>2024-2025</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-stats mb-6">
        <div className="stat-card stat-primary animate-slideUp" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon"><HiOutlineUserGroup size={22} /></div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
          <span className="stat-change positive">
            <HiOutlineArrowTrendingUp size={12} /> +12 this month
          </span>
        </div>

        <div className="stat-card stat-success animate-slideUp" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon"><HiOutlineBriefcase size={22} /></div>
          <div className="stat-value">{stats.totalStaff}</div>
          <div className="stat-label">Total Staff</div>
          <span className="stat-change positive">
            <HiOutlineArrowTrendingUp size={12} /> +2 new
          </span>
        </div>

        <div className="stat-card stat-warning animate-slideUp" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon"><HiOutlineBanknotes size={22} /></div>
          <div className="stat-value">{stats.feesCollected}</div>
          <div className="stat-label">Fees Collected (Sep)</div>
          <span className="stat-change positive">
            <HiOutlineArrowTrendingUp size={12} /> 87% collected
          </span>
        </div>

        <div className="stat-card stat-info animate-slideUp" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon"><HiOutlineCheckCircle size={22} /></div>
          <div className="stat-value">{stats.attendance}</div>
          <div className="stat-label">Today's Attendance</div>
          <span className="stat-change negative">
            <HiOutlineArrowTrendingDown size={12} /> -1.3% vs avg
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* Attendance Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weekly Attendance</span>
            <span className="badge badge-success">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1a2342',
                  border: '1px solid rgba(148,163,184,0.12)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '0.813rem',
                }}
              />
              <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present %" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent %" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Collection Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fee Collection Trend</span>
            <span className="badge badge-warning">2025-26</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={feeData}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{
                  background: '#1a2342',
                  border: '1px solid rgba(148,163,184,0.12)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '0.813rem',
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="collected" stroke="#6366f1" fill="url(#colorCollected)" strokeWidth={2} name="Collected" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Pending" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-3">
        {/* Class Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Student Distribution</span>
          </div>
          <div className="flex items-center justify-center" style={{ gap: '24px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a2342',
                    border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '10px',
                    color: '#f1f5f9',
                    fontSize: '0.813rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {classDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                  <span className="text-sm text-secondary">{item.name}</span>
                  <span className="text-sm" style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Classes (Admin View) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live / Online Classes</span>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-400)' }}><HiOutlinePlay size={16}/> Start New</button>
          </div>
          <div className="flex flex-col gap-3">
            {liveClasses.map(cls => (
              <div key={cls.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${cls.status === 'Live' ? 'bg-danger-500 animate-pulse' : 'bg-primary-500'}`}>
                    <HiOutlineVideoCamera size={14} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>{cls.subject}</p>
                    <p className="text-xs text-secondary">{cls.time}</p>
                  </div>
                </div>
                {cls.status === 'Live' && <span className="badge badge-danger">LIVE</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="activity-feed">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item" style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-secondary)',
              }}>
                <span className={`badge badge-${activity.type}`} style={{
                  marginTop: '2px', width: '8px', height: '8px', minWidth: '8px', padding: 0, borderRadius: '50%',
                }}></span>
                <div style={{ flex: 1 }}>
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-tertiary mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ user }) {
  const [stats] = useState({
    myStudents: 120,
    classesToday: 4,
    assignmentsToGrade: 15,
    attendance: '95.2%',
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="subtitle">Welcome back, {user?.name || 'Teacher'}! Here's your class overview.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-stats mb-6">
        <div className="stat-card stat-primary animate-slideUp" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon"><HiOutlineUserGroup size={22} /></div>
          <div className="stat-value">{stats.myStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card stat-success animate-slideUp" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon"><HiOutlineVideoCamera size={22} /></div>
          <div className="stat-value">{stats.classesToday}</div>
          <div className="stat-label">Classes Today</div>
        </div>
        <div className="stat-card stat-warning animate-slideUp" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon"><HiOutlineBookOpen size={22} /></div>
          <div className="stat-value">{stats.assignmentsToGrade}</div>
          <div className="stat-label">Assignments to Grade</div>
        </div>
        <div className="stat-card stat-info animate-slideUp" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon"><HiOutlineCheckCircle size={22} /></div>
          <div className="stat-value">{stats.attendance}</div>
          <div className="stat-label">Avg. Class Attendance</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Schedule</span>
          </div>
          <div className="flex flex-col gap-3">
            {liveClasses.map(cls => (
              <div key={cls.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--bg-input)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${cls.status === 'Live' ? 'bg-danger-500 animate-pulse' : 'bg-primary-500'}`}>
                    <HiOutlineVideoCamera size={14} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>{cls.subject}</p>
                    <p className="text-xs text-secondary">{cls.time}</p>
                  </div>
                </div>
                <button className={`btn btn-sm ${cls.status === 'Live' ? 'btn-danger' : 'btn-primary'}`}>
                  {cls.status === 'Live' ? 'Join' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
          </div>
          <div className="activity-feed">
             <div className="activity-item" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <p className="text-sm">Ravi missed class 10 Mathematics.</p>
                <p className="text-xs text-tertiary mt-1">2 hours ago</p>
             </div>
             <div className="activity-item" style={{ padding: '12px 0' }}>
                <p className="text-sm">You assigned "Newton Laws" homework.</p>
                <p className="text-xs text-tertiary mt-1">1 day ago</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
