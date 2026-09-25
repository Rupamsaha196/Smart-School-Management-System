import { useState, useEffect } from 'react';
import { HiOutlineQrCode, HiOutlineCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function QrAttendance() {
  const [scannedData, setScannedData] = useState('');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, students: 0, staff: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/qr-attendance'),
        api.get('/qr-attendance/today-stats'),
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scannedData) return;

    try {
      const { data } = await api.post('/qr-attendance/scan', { identifier: scannedData });
      setLogs([data, ...logs]);
      setStats(prev => ({
        total: prev.total + 1,
        students: data.person_type === 'Student' ? prev.students + 1 : prev.students,
        staff: data.person_type === 'Staff' ? prev.staff + 1 : prev.staff,
      }));
      setScannedData('');
      toast.success('Attendance marked via QR/Barcode');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed');
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>QR / Barcode Attendance</h1>
          <p className="subtitle">Fast and contactless attendance marking system</p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-xs text-secondary mb-1">Total Today</p>
          <h2 className="text-h2 text-primary-400">{stats.total}</h2>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-secondary mb-1">Students</p>
          <h2 className="text-h2 text-success">{stats.students}</h2>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-secondary mb-1">Staff</p>
          <h2 className="text-h2 text-warning">{stats.staff}</h2>
        </div>
      </div>

      <div className="grid-2 gap-6">
        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><HiOutlineQrCode/> Scan ID Card</span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center border-dashed rounded-md mt-4" style={{ borderWidth: '2px', borderColor: 'var(--border-secondary)', background: 'var(--bg-input)' }}>
            <HiOutlineQrCode size={120} className="text-secondary mb-4 opacity-50" />
            <p className="text-center text-secondary mb-6">Point the scanner at the QR code or Barcode on the ID card</p>

            <form onSubmit={handleScan} className="w-full flex gap-2">
              <input
                type="text"
                className="form-input"
                placeholder="Scanner input here... (e.g. T1001 or S2045)"
                value={scannedData}
                onChange={e => setScannedData(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Process</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><HiOutlineCheckCircle/> Recent Scans</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center"><span className="spinner"></span></div>
            ) : logs.length === 0 ? (
              <p className="text-secondary text-center p-4">No recent scans</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-3 rounded-md flex justify-between items-center" style={{ background: 'var(--bg-input)' }}>
                  <div>
                    <h4 className="font-semibold text-primary-400">{log.name}</h4>
                    <span className="text-xs text-secondary">{log.person_type} · {log.identifier}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-success font-semibold text-sm">{log.status}</span>
                    <div className="text-xs text-secondary">{formatTime(log.scanned_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
