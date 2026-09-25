import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/students/StudentList';
import AdmissionForm from './pages/students/AdmissionForm';
import StudentProfile from './pages/students/StudentProfile';
import TransferCertificate from './pages/students/TransferCertificate';
import BehaviorRecords from './pages/students/BehaviorRecords';
import ClassList from './pages/academics/ClassList';
import SubjectList from './pages/academics/SubjectList';
import SessionList from './pages/academics/SessionList';
import StudentPromotion from './pages/academics/StudentPromotion';
import ClassTimetable from './pages/academics/ClassTimetable';
import DownloadCenter from './pages/academics/DownloadCenter';
import LiveClasses from './pages/academics/LiveClasses';
import AnnualCalendar from './pages/academics/AnnualCalendar';
import AttendanceMark from './pages/attendance/AttendanceMark';
import AttendanceReport from './pages/attendance/AttendanceReport';
import QrAttendance from './pages/attendance/QrAttendance';
import ExamList from './pages/exams/ExamList';
import MarksEntry from './pages/exams/MarksEntry';
import AdmitCard from './pages/exams/AdmitCard';
import FeeStructure from './pages/fees/FeeStructure';
import FeeCollection from './pages/fees/FeeCollection';
import IncomeExpense from './pages/finance/IncomeExpense';
import StaffList from './pages/hr/StaffList';
import StaffAttendance from './pages/hr/StaffAttendance';
import NoticeBoard from './pages/communication/NoticeBoard';
import Settings from './pages/settings/Settings';
import CustomFields from './pages/settings/CustomFields';
import TwoFactorAuth from './pages/settings/TwoFactorAuth';
import LibraryManagement from './pages/operations/LibraryManagement';
import TransportManagement from './pages/operations/TransportManagement';
import HostelManagement from './pages/operations/HostelManagement';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Students */}
        <Route path="students" element={<StudentList />} />
        <Route path="students/admission" element={<AdmissionForm />} />
        <Route path="students/tc" element={<TransferCertificate />} />
        <Route path="students/behavior" element={<BehaviorRecords />} />
        <Route path="students/:id" element={<StudentProfile />} />

        {/* Academics */}
        <Route path="academics/classes" element={<ClassList />} />
        <Route path="academics/subjects" element={<SubjectList />} />
        <Route path="academics/sessions" element={<SessionList />} />
        <Route path="academics/promotion" element={<StudentPromotion />} />
        <Route path="academics/timetable" element={<ClassTimetable />} />
        <Route path="academics/downloads" element={<DownloadCenter />} />
        <Route path="academics/live-classes" element={<LiveClasses />} />
        <Route path="academics/calendar" element={<AnnualCalendar />} />

        {/* Attendance */}
        <Route path="attendance/mark" element={<AttendanceMark />} />
        <Route path="attendance/report" element={<AttendanceReport />} />
        <Route path="attendance/qr" element={<QrAttendance />} />

        {/* Exams */}
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/marks" element={<MarksEntry />} />
        <Route path="exams/admit-card" element={<AdmitCard />} />

        {/* Finance */}
        <Route path="fees/structure" element={<FeeStructure />} />
        <Route path="fees/collection" element={<FeeCollection />} />
        <Route path="finance/income-expense" element={<IncomeExpense />} />

        {/* HR */}
        <Route path="staff" element={<StaffList />} />
        <Route path="staff/attendance" element={<StaffAttendance />} />

        {/* Operations */}
        <Route path="operations/library" element={<LibraryManagement />} />
        <Route path="operations/transport" element={<TransportManagement />} />
        <Route path="operations/hostel" element={<HostelManagement />} />

        {/* Communication */}
        <Route path="notices" element={<NoticeBoard />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
        <Route path="settings/custom-fields" element={<CustomFields />} />
        <Route path="settings/2fa" element={<TwoFactorAuth />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
