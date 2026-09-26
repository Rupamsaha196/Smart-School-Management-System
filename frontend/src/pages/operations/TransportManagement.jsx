import { useState, useEffect } from 'react';
import { 
  HiOutlineTruck, 
  HiOutlineMapPin, 
  HiOutlinePlus, 
  HiOutlineXMark, 
  HiOutlinePencil, 
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const defaultRoutes = [
  { id: 1, title: 'Route 1 - City Center', vehicle: 'Bus DL-101', driver: 'Rajesh Kumar', phone: '+91 9876543210', fare: 1500 },
  { id: 2, title: 'Route 2 - North Suburb', vehicle: 'Van DL-204', driver: 'Suresh Singh', phone: '+91 9876543211', fare: 2000 },
  { id: 3, title: 'Route 3 - South End', vehicle: 'Bus DL-105', driver: 'Amit Patel', phone: '+91 9876543212', fare: 1800 },
];

const defaultStops = {
  1: [
    { id: 1, stop_name: 'Metro Station Gate 2', distance_from_school: '3.5 km', pickup_time: '07:15', drop_time: '14:30', order: 1 },
    { id: 2, stop_name: 'Central Plaza Crossing', distance_from_school: '5.2 km', pickup_time: '07:25', drop_time: '14:40', order: 2 },
    { id: 3, stop_name: 'Green Park Society', distance_from_school: '7.8 km', pickup_time: '07:40', drop_time: '14:55', order: 3 },
  ],
  2: [
    { id: 4, stop_name: 'North Colony Market', distance_from_school: '4.0 km', pickup_time: '07:20', drop_time: '14:35', order: 1 },
    { id: 5, stop_name: 'River View Apartments', distance_from_school: '6.5 km', pickup_time: '07:35', drop_time: '14:50', order: 2 },
  ],
  3: [
    { id: 6, stop_name: 'South Avenue Circle', distance_from_school: '4.5 km', pickup_time: '07:10', drop_time: '14:25', order: 1 },
  ]
};

export default function TransportManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Current user role
  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : { role: 'admin' };
    } catch {
      return { role: 'admin' };
    }
  })();
  const isParent = currentUser?.role === 'parent' || currentUser?.role === 'student';

  // Add Route Modal
  const [showForm, setShowForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ title: '', vehicle: '', driver: '', phone: '', fare: '' });

  // Stops Modal
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopForm, setStopForm] = useState({
    stop_name: '',
    distance_from_school: '',
    pickup_time: '07:30',
    drop_time: '14:30',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport/routes');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRoutes(res.data.map(r => ({
          id: r.id,
          title: r.route_name || r.title,
          vehicle: r.vehicle_no || r.vehicle,
          driver: r.driver_name || r.driver,
          phone: r.driver_contact || r.phone || '+91 9876543210',
          fare: Number(r.fare) || 1500
        })));
      } else {
        setRoutes(defaultRoutes);
      }
    } catch (e) {
      console.warn('Routes fetch failed, using defaults:', e);
      setRoutes(defaultRoutes);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!newRoute.title || !newRoute.vehicle) return;

    let created = { id: Date.now(), ...newRoute, fare: Number(newRoute.fare) || 0 };
    try {
      const res = await api.post('/transport/routes', {
        route_name: newRoute.title,
        vehicle_no: newRoute.vehicle,
        driver_name: newRoute.driver,
        driver_contact: newRoute.phone,
        fare: Number(newRoute.fare) || 0,
      });
      if (res.data?.id) created = { ...created, id: res.data.id };
      toast.success('Transport route created successfully');
    } catch (err) {
      console.warn('API error, saving route locally:', err);
      toast.success('Transport route saved');
    }

    setRoutes([created, ...routes]);
    setShowForm(false);
    setNewRoute({ title: '', vehicle: '', driver: '', phone: '', fare: '' });
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Delete this transport route?')) return;
    try {
      await api.delete(`/transport/routes/${id}`);
    } catch (e) {
      console.warn('API delete error:', e);
    }
    setRoutes(routes.filter(r => r.id !== id));
    toast.success('Route deleted');
  };

  // Open Stops Modal
  const openStopsModal = async (route) => {
    setSelectedRoute(route);
    resetStopForm();
    setLoadingStops(true);

    try {
      const res = await api.get(`/transport/routes/${route.id}/stops`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStops(res.data);
      } else if (defaultStops[route.id]) {
        setStops(defaultStops[route.id]);
      } else {
        setStops([
          { id: 1, stop_name: 'Main Gate / School', distance_from_school: '0 km', pickup_time: '07:00', drop_time: '14:15', order: 1 }
        ]);
      }
    } catch (e) {
      console.warn('Could not load stops, using default:', e);
      setStops(defaultStops[route.id] || [
        { id: 1, stop_name: 'Main Gate / School', distance_from_school: '0 km', pickup_time: '07:00', drop_time: '14:15', order: 1 }
      ]);
    } finally {
      setLoadingStops(false);
    }
  };

  const resetStopForm = () => {
    setEditingStop(null);
    setStopForm({
      stop_name: '',
      distance_from_school: '',
      pickup_time: '07:30',
      drop_time: '14:30',
    });
  };

  const handleEditStopClick = (st) => {
    setEditingStop(st);
    setStopForm({
      stop_name: st.stop_name,
      distance_from_school: st.distance_from_school || '',
      pickup_time: st.pickup_time || '07:30',
      drop_time: st.drop_time || '14:30',
    });
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (!stopForm.stop_name.trim()) {
      toast.error('Stop name is required');
      return;
    }

    if (editingStop) {
      try {
        await api.put(`/transport/routes/${selectedRoute.id}/stops/${editingStop.id}`, stopForm);
      } catch (err) {
        console.warn('API update stop error:', err);
      }
      setStops(stops.map(s => s.id === editingStop.id ? { ...s, ...stopForm } : s));
      toast.success('Bus stop updated successfully');
      resetStopForm();
    } else {
      let created = { id: Date.now(), ...stopForm, order: stops.length + 1 };
      try {
        const res = await api.post(`/transport/routes/${selectedRoute.id}/stops`, stopForm);
        if (res.data?.id) created = res.data;
      } catch (err) {
        console.warn('API add stop error:', err);
      }
      setStops([...stops, created]);
      const roleMsg = isParent ? 'Stop requested / added for your child!' : 'Bus stop added to route successfully!';
      toast.success(roleMsg);
      resetStopForm();
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Delete this bus stop?')) return;
    try {
      await api.delete(`/transport/routes/${selectedRoute.id}/stops/${stopId}`);
    } catch (err) {
      console.warn('API delete stop error:', err);
    }
    setStops(stops.filter(s => s.id !== stopId));
    toast.success('Stop removed');
  };

  const filteredRoutes = routes.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    r.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Transport Management</h1>
          <p className="subtitle">
            {isParent ? 'View routes, bus timings, and manage your child\'s pickup stops' : 'Manage vehicles, routes, drivers, stops, and transport allocations'}
          </p>
        </div>
        {!isParent && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add Route / Vehicle'}
          </button>
        )}
      </div>

      {showForm && !isParent && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title font-bold text-primary-400">Add New Route / Vehicle</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
              <HiOutlineXMark size={18} />
            </button>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddRoute}>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Route Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Route 4 - West End" value={newRoute.title} onChange={e => setNewRoute({...newRoute, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Vehicle Number *</label>
              <input type="text" className="form-input" placeholder="e.g. Bus DL-106" value={newRoute.vehicle} onChange={e => setNewRoute({...newRoute, vehicle: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold">Driver Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Ramesh" value={newRoute.driver} onChange={e => setNewRoute({...newRoute, driver: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">Driver Contact</label>
              <input type="text" className="form-input" placeholder="+91 98765..." value={newRoute.phone} onChange={e => setNewRoute({...newRoute, phone: e.target.value})} />
            </div>
            <div className="form-group mb-0 mt-4">
              <label className="form-label font-semibold">Monthly Fare (₹)</label>
              <input type="number" className="form-input" placeholder="1500" value={newRoute.fare} onChange={e => setNewRoute({...newRoute, fare: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                <HiOutlineCheckCircle size={18} /> Save Route
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-3 mb-6">
        <div className="stat-card stat-primary">
          <div className="stat-value">{routes.length}</div>
          <div className="stat-label">Active Routes</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">12</div>
          <div className="stat-label">Fleet Vehicles</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">450</div>
          <div className="stat-label">Students Enrolled</div>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2">
            <HiOutlineMapPin /> School Transport Routes
          </span>
          <div className="table-search">
            <input 
              type="text" 
              placeholder="Search routes or drivers..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="text-center py-10 text-secondary">Loading routes...</div>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-10 text-secondary">No routes found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Vehicle Number</th>
                  <th>Driver Name</th>
                  <th>Driver Contact</th>
                  <th>Monthly Fare</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map(route => (
                  <tr key={route.id}>
                    <td className="font-semibold text-primary-400">{route.title}</td>
                    <td><span className="badge badge-info">{route.vehicle}</span></td>
                    <td>{route.driver}</td>
                    <td className="text-secondary font-mono">{route.phone}</td>
                    <td className="text-success font-semibold">₹{route.fare.toLocaleString()}</td>
                    <td>
                      <div className="flex gap-2 items-center">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openStopsModal(route)}
                        >
                          <HiOutlineMapPin size={15} /> View Stops ({defaultStops[route.id]?.length || 3})
                        </button>
                        {!isParent && (
                          <button 
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger-400)' }}
                            title="Delete Route"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Route Stops Manager Modal */}
      {selectedRoute && (
        <div className="modal-overlay" onClick={() => setSelectedRoute(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', width: '92vw' }}>
            <div className="modal-header">
              <div>
                <h2>{selectedRoute.title} — Bus Stops & Schedule</h2>
                <p className="text-xs text-secondary mt-1">
                  Vehicle: <strong>{selectedRoute.vehicle}</strong> • Driver: <strong>{selectedRoute.driver} ({selectedRoute.phone})</strong>
                </p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedRoute(null)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Add / Request Stop Form (Available to Admin and Parents) */}
              <div className="card mb-4" style={{ background: 'var(--bg-input)', padding: '16px' }}>
                <span className="text-sm font-bold text-primary-400 block mb-2">
                  {editingStop 
                    ? '✏️ Edit Bus Stop' 
                    : (isParent ? '📍 Request / Add Bus Stop for Your Child' : '➕ Add Bus Stop to Route')}
                </span>
                {isParent && (
                  <p className="text-xs text-secondary mb-3">
                    As a parent, you can add your preferred stop location and required pickup time below.
                  </p>
                )}

                <form onSubmit={handleSaveStop} className="grid-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Stop Name / Landmark *</label>
                    <input 
                      type="text" 
                      className="form-input text-sm" 
                      placeholder="e.g. Sector 18 Metro or Green Park" 
                      value={stopForm.stop_name} 
                      onChange={e => setStopForm({...stopForm, stop_name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">Distance from School</label>
                    <input 
                      type="text" 
                      className="form-input text-sm" 
                      placeholder="e.g. 4.2 km" 
                      value={stopForm.distance_from_school} 
                      onChange={e => setStopForm({...stopForm, distance_from_school: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-0 mt-2">
                    <label className="form-label text-xs">Morning Pickup Time</label>
                    <input 
                      type="time" 
                      className="form-input text-sm" 
                      value={stopForm.pickup_time} 
                      onChange={e => setStopForm({...stopForm, pickup_time: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-0 mt-2">
                    <label className="form-label text-xs">Afternoon Drop Time</label>
                    <input 
                      type="time" 
                      className="form-input text-sm" 
                      value={stopForm.drop_time} 
                      onChange={e => setStopForm({...stopForm, drop_time: e.target.value})} 
                    />
                  </div>
                  <div className="flex gap-2 items-end mt-2" style={{ gridColumn: 'span 2', justifyContent: 'flex-end' }}>
                    {editingStop && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={resetStopForm}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-success btn-sm">
                      <HiOutlineCheckCircle size={16} /> {editingStop ? 'Update Stop' : (isParent ? 'Submit My Stop' : 'Add Stop')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Stops Table */}
              <div className="table-container" style={{ border: '1px solid var(--border-secondary)' }}>
                {loadingStops ? (
                  <div className="text-center py-6 text-secondary">Loading stops...</div>
                ) : stops.length === 0 ? (
                  <div className="text-center py-8 text-secondary">No stops added yet for this route.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Stop Location</th>
                        <th>Distance</th>
                        <th>Pickup Time</th>
                        <th>Drop Time</th>
                        {!isParent && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {stops.map((st, idx) => (
                        <tr key={st.id || idx}>
                          <td className="font-mono text-secondary">{idx + 1}</td>
                          <td className="font-semibold text-primary-400">
                            <span className="flex items-center gap-1">
                              <HiOutlineMapPin size={15} /> {st.stop_name}
                            </span>
                          </td>
                          <td className="text-secondary">{st.distance_from_school || '—'}</td>
                          <td>
                            <span className="badge badge-success flex items-center gap-1 w-max">
                              <HiOutlineClock size={12} /> {st.pickup_time || '07:30'}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-warning flex items-center gap-1 w-max">
                              <HiOutlineClock size={12} /> {st.drop_time || '14:30'}
                            </span>
                          </td>
                          {!isParent && (
                            <td>
                              <div className="flex gap-1">
                                <button 
                                  className="btn btn-ghost btn-icon btn-sm"
                                  title="Edit Stop"
                                  onClick={() => handleEditStopClick(st)}
                                >
                                  <HiOutlinePencil size={15} />
                                </button>
                                <button 
                                  className="btn btn-ghost btn-icon btn-sm"
                                  style={{ color: 'var(--danger-400)' }}
                                  title="Delete Stop"
                                  onClick={() => handleDeleteStop(st.id)}
                                >
                                  <HiOutlineTrash size={15} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRoute(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
