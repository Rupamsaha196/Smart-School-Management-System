import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineMegaphone,
  HiOutlineCog6Tooth,
  HiOutlineBookOpen,
  HiOutlineTruck,
  HiOutlineBuildingOffice,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineVideoCamera,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

const menuSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: HiOutlineHome, roles: ['super_admin', 'admin', 'teacher', 'accountant', 'receptionist', 'librarian', 'parent', 'student'] },
    ],
  },
  {
    title: 'Academic',
    items: [
      { label: 'Students', path: '/students', icon: HiOutlineUserGroup, roles: ['super_admin', 'admin', 'teacher', 'receptionist'] },
      { label: 'New Admission', path: '/students/admission', icon: HiOutlineClipboardDocumentList, roles: ['super_admin', 'admin', 'receptionist'] },
      { label: 'Transfer Certificate', path: '/students/tc', icon: HiOutlineDocumentText, roles: ['super_admin', 'admin'] },
      { label: 'Behavior Records', path: '/students/behavior', icon: HiOutlineClipboardDocumentList, roles: ['super_admin', 'admin', 'teacher'] },
      { label: 'Classes', path: '/academics/classes', icon: HiOutlineAcademicCap, roles: ['super_admin', 'admin'] },
      { label: 'Subjects', path: '/academics/subjects', icon: HiOutlineBookOpen, roles: ['super_admin', 'admin'] },
      { label: 'Sessions', path: '/academics/sessions', icon: HiOutlineCalendarDays, roles: ['super_admin', 'admin'] },
      { label: 'Timetable', path: '/academics/timetable', icon: HiOutlineCalendarDays, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
      { label: 'Annual Calendar', path: '/academics/calendar', icon: HiOutlineCalendarDays, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
      { label: 'Download Center', path: '/academics/downloads', icon: HiOutlineDocumentText, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
      { label: 'Live Classes', path: '/academics/live-classes', icon: HiOutlineVideoCamera, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Mark Attendance', path: '/attendance/mark', icon: HiOutlineCheckCircle, roles: ['super_admin', 'admin', 'teacher'] },
      { label: 'QR Attendance', path: '/attendance/qr', icon: HiOutlineCheckCircle, roles: ['super_admin', 'admin', 'teacher', 'receptionist'] },
      { label: 'Attendance Report', path: '/attendance/report', icon: HiOutlineChartBarSquare, roles: ['super_admin', 'admin', 'teacher'] },
      { label: 'Examinations', path: '/exams', icon: HiOutlineDocumentText, roles: ['super_admin', 'admin', 'teacher'] },
      { label: 'Marks Entry', path: '/exams/marks', icon: HiOutlineClipboardDocumentList, roles: ['super_admin', 'admin', 'teacher'] },
      { label: 'Admit Card', path: '/exams/admit-card', icon: HiOutlineDocumentText, roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'] },
      { label: 'Library', path: '/operations/library', icon: HiOutlineBookOpen, roles: ['super_admin', 'admin', 'librarian', 'teacher', 'student'] },
      { label: 'Transport', path: '/operations/transport', icon: HiOutlineTruck, roles: ['super_admin', 'admin', 'parent', 'student'] },
      { label: 'Hostel', path: '/operations/hostel', icon: HiOutlineBuildingOffice, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Fee Structure', path: '/fees/structure', icon: HiOutlineBanknotes, roles: ['super_admin', 'admin', 'accountant'] },
      { label: 'Fee Collection', path: '/fees/collection', icon: HiOutlineBanknotes, roles: ['super_admin', 'admin', 'accountant'] },
      { label: 'Income & Expense', path: '/finance/income-expense', icon: HiOutlineBanknotes, roles: ['super_admin', 'admin', 'accountant'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Staff', path: '/staff', icon: HiOutlineBriefcase, roles: ['super_admin', 'admin'] },
      { label: 'Staff Attendance', path: '/staff/attendance', icon: HiOutlineCheckCircle, roles: ['super_admin', 'admin'] },
      { label: 'Notices', path: '/notices', icon: HiOutlineMegaphone, roles: ['super_admin', 'admin', 'teacher', 'accountant', 'receptionist', 'librarian', 'parent', 'student'] },
      { label: 'Settings', path: '/settings', icon: HiOutlineCog6Tooth, roles: ['super_admin', 'admin'] },
      { label: 'Custom Fields', path: '/settings/custom-fields', icon: HiOutlineDocumentText, roles: ['super_admin', 'admin'] },
      { label: 'Two-Factor Login', path: '/settings/2fa', icon: HiOutlineShieldCheck, roles: ['super_admin', 'admin', 'teacher', 'accountant', 'receptionist', 'librarian', 'parent', 'student'] },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user?.role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="logo">SS</div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Smart School</span>
            <span className="brand-subtitle">Management System</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {filteredSections.map((section) => (
          <div className="nav-section" key={section.title}>
            {!collapsed && <div className="nav-section-title">{section.title}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`
                }
                end={item.path === '/dashboard'}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
