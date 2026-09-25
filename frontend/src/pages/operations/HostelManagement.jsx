import { useState } from 'react';
import { HiOutlineBuildingOffice, HiOutlinePlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const initialRooms = [
  { id: 1, hostel: 'Boys Hostel A', room: '101', type: '2 Bed', cost: 3500, capacity: 2, occupied: 2 },
  { id: 2, hostel: 'Boys Hostel A', room: '102', type: '4 Bed', cost: 2500, capacity: 4, occupied: 1 },
  { id: 3, hostel: 'Girls Hostel B', room: '201', type: '2 Bed', cost: 3500, capacity: 2, occupied: 0 },
];

export default function HostelManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [showForm, setShowForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ hostel: '', room: '', type: '2 Bed', cost: '', capacity: 2 });

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoom.hostel || !newRoom.room) return;
    setRooms([{ 
      id: Date.now(), 
      ...newRoom,
      cost: Number(newRoom.cost) || 0,
      occupied: 0
    }, ...rooms]);
    setShowForm(false);
    setNewRoom({ hostel: '', room: '', type: '2 Bed', cost: '', capacity: 2 });
    setNewRoom({ hostel: '', room: '', type: '2 Bed', cost: '', capacity: 2 });
  };

  const handleAllocate = (roomId) => {
    const studentId = window.prompt("Enter Admission Number of the student to allocate (e.g., SS20260007):");
    if (!studentId) return;

    setRooms(rooms.map(room => {
      if (room.id === roomId && room.capacity > room.occupied) {
        toast.success(`Room ${room.room} allocated to ${studentId} successfully!`);
        return { ...room, occupied: room.occupied + 1 };
      }
      return room;
    }));
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Hostel Management</h1>
          <p className="subtitle">Manage hostel buildings, room allocations, and fees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus size={18}/> {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slideUp">
          <div className="card-header">
            <span className="card-title">Add New Room</span>
          </div>
          <form className="p-4 grid-3" onSubmit={handleAddRoom}>
            <div className="form-group mb-0">
              <label>Hostel Name</label>
              <input type="text" className="form-input" placeholder="e.g. Boys Hostel B" value={newRoom.hostel} onChange={e => setNewRoom({...newRoom, hostel: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Room Number</label>
              <input type="text" className="form-input" placeholder="e.g. 305" value={newRoom.room} onChange={e => setNewRoom({...newRoom, room: e.target.value})} required />
            </div>
            <div className="form-group mb-0">
              <label>Room Type</label>
              <select className="form-select" value={newRoom.type} onChange={e => {
                const type = e.target.value;
                const capacity = parseInt(type.split(' ')[0]);
                setNewRoom({...newRoom, type, capacity});
              }}>
                <option>1 Bed</option>
                <option>2 Bed</option>
                <option>3 Bed</option>
                <option>4 Bed</option>
              </select>
            </div>
            <div className="form-group mb-0 mt-4">
              <label>Cost per Bed (₹)</label>
              <input type="number" className="form-input" placeholder="3000" value={newRoom.cost} onChange={e => setNewRoom({...newRoom, cost: e.target.value})} required />
            </div>
            <div className="form-group flex items-end mb-0 mt-4" style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-success w-full" style={{ height: '42px' }}>
                Save Room
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-4 mb-6">
        <div className="stat-card stat-primary">
          <div className="stat-value">3</div>
          <div className="stat-label">Total Hostels</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{rooms.length}</div>
          <div className="stat-label">Total Rooms</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{rooms.reduce((acc, curr) => acc + (curr.capacity - curr.occupied), 0)}</div>
          <div className="stat-label">Available Beds</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{rooms.reduce((acc, curr) => acc + curr.occupied, 0)}</div>
          <div className="stat-label">Hostel Students</div>
        </div>
      </div>

      <div className="card animate-slideUp">
        <div className="table-toolbar">
          <span className="card-title flex items-center gap-2"><HiOutlineBuildingOffice/> Room Availability & Allocation</span>
          <div className="table-search">
            <input type="text" placeholder="Search rooms or hostels..." />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hostel Name</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Cost per Bed</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td className="font-semibold text-primary-400">{room.hostel}</td>
                  <td>{room.room}</td>
                  <td><span className="badge badge-info">{room.type}</span></td>
                  <td className="text-success font-semibold">₹{room.cost.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${room.capacity - room.occupied > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {room.capacity - room.occupied} Beds Available
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleAllocate(room.id)} className="btn btn-sm btn-ghost text-primary-400" disabled={room.capacity === room.occupied}>
                      Allocate Student
                    </button>
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
