import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      teacher: 'Teacher',
      accountant: 'Accountant',
      receptionist: 'Receptionist',
      librarian: 'Librarian',
      parent: 'Parent',
      student: 'Student',
    };
    return labels[role] || role;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn-ghost btn-icon" onClick={onToggleSidebar}>
          <HiOutlineBars3 size={22} />
        </button>
        <div className="header-search">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input type="text" placeholder="Search students, staff, classes..." />
        </div>
      </div>

      <div className="header-right">
        <button className="notification-btn">
          <HiOutlineBell />
          <span className="notification-badge"></span>
        </button>

        <div className="user-menu">
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{getRoleLabel(user?.role)}</div>
          </div>
          <div className="avatar-placeholder avatar-sm">
            {getInitials(user?.name)}
          </div>
        </div>

        <button className="btn-ghost btn-icon" onClick={handleLogout} title="Logout">
          <HiOutlineArrowRightOnRectangle size={20} />
        </button>
      </div>
    </header>
  );
}
