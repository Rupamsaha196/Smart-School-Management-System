import { useState } from 'react';
import { HiOutlineTruck, HiOutlineMapPin, HiOutlinePlus } from 'react-icons/hi2';

const initialRoutes = [
  { id: 1, title: 'Route 1 - City Center', vehicle: 'Bus DL-101', driver: 'Rajesh Kumar', phone: '+91 9876543210', fare: 1500 },
  { id: 2, title: 'Route 2 - North Suburb', vehicle: 'Van DL-204', driver: 'Suresh Singh', phone: '+91 9876543211', fare: 2000 },
  { id: 3, title: 'Route 3 - South End', vehicle: 'Bus DL-105', driver: 'Amit Patel', phone: '+91 9876543212', fare: 1800 },
];

export default function TransportManagement() {
  const [routes, setRoutes] = useState(initialRoutes);
  const [showForm, setShowForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ title: '', vehicle: '', driver: '', phone: '', fare: '' });

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newRoute.title || !newRoute.vehicle) return;
    setRoutes([{ 
      id: Date.now(), 
      ...newRoute,
      fare: Number(newRoute.fare) || 0
    }, ...routes]);
    setShowForm(false);
    setNewRoute({ title: '', vehicle: '', driver: '', phone: '', fare: '' });
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Transport Management</h1>
          <p className="subtitle">Manage vehicles, routes, drivers, and transport fees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add Route/Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Add New Route/Vehicle</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddRoute}>
            <div className="form-group mb-0">
              <label>Route Name</label>
              <input type="text" className="form-input" placeholder="e.g. Route 4 - West End" value={newRoute.title} onChange={e => setNewRoute({...newRoute, title: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Vehicle Number</label>
              <input type="text" className="form-input" placeholder="e.g. Bus DL-106" value={newRoute.vehicle} onChange={e => setNewRoute({...newRoute, vehicle: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Driver Name</label>
              <input type="text" className="form-input" placeholder="e.g. Ramesh" value={newRoute.driver} onChange={e => setNewRoute({...newRoute, driver: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Driver Contact</label>
              <input type="text" className="form-input" placeholder="+91..." value={newRoute.phone} onChange={e => setNewRoute({...newRoute, phone: e.target.value})} required />
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Monthly Fare (₹)</label>
              <input type="number" className="form-input" placeholder="1500" value={newRoute.fare} onChange={e => setNewRoute({...newRoute, fare: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4">
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                Save Route
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-3 mb-6">
        <div className="stat-card stat-primary">
          <div className="stat-value">12</div>
          <div className="stat-label">Total Vehicles</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{routes.length}</div>
          <div className="stat-label">Active Routes</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">450</div>
          <div className="stat-label">Students Using Transport</div>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineMapPin/> Transport Routes & Allocation</span>
          <div className="table-search">
            <input type="text" placeholder="Search routes or drivers..." />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Vehicle Number</th>
                <th>Driver Name</th>
                <th>Driver Contact</th>
                <th>Monthly Fare</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id}>
                  <td className="font-semibold text-primary-400">{route.title}</td>
                  <td><span className="badge badge-info">{route.vehicle}</span></td>
                  <td>{route.driver}</td>
                  <td className="text-secondary font-mono">{route.phone}</td>
                  <td className="text-success font-semibold">₹{route.fare.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost text-primary-400">View Stops</button>
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
