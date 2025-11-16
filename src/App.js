import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students from './pages/students/Students';
import FacultyList from './pages/faculty/FacultyList';
import Marks from './pages/Marks';
import Attendance from './pages/Attendance';
import PageNotFound from './pages/PageNotFound';
import Reports from './pages/Reports';
import Late from './pages/Late';
import SecurityLateEntry from './pages/SecurityLateEntry';
import ForgotPassword from './components/forgotpassword';
import ResetPassword from './components/resetpassword';
import StudentAttendance from './pages/attendance/ViewAttendance';
import MarkAttendance from './pages/attendance/MarkAttendance';
import ReportsPage from './pages/attendance/Reports';
import ManageStaff from './pages/attendance/ManageStaff';
import EnterMarks from './pages/marks/EnterMarks';
import ViewMarks from './pages/marks/ViewMarks'
import PrincipalOverview from './pages/marks/PrincipalOverview';
import DepartmentAnalysis from './pages/marks/DepartmentAnalysis';
import TopPerformers from './pages/marks/TopPerformers';
import NetworkAlert from './components/NetworkAlert';
import FeesStudentView from './pages/Fees/FeesStudentView';
import Home from './pages/Home';
import Fees from './pages/Fees';
import FeesList from './pages/Fees/FeesList';
import Feesanalytics from './pages/Fees/FeesAnalytics';
import FeesAdd from './pages/Fees/FeesAdd';

export default function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      <NetworkAlert />
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onHamburgerClick={() => setSidebarOpen(prev => !prev)}
      />

      {user && (
        <Sidebar
          role={user.role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main className="pt-16 p-6 text-slate-800 dark:text-slate-100">
        <Routes>
          {/* Public routes */}
          <Route path="/Erp_Mnmjec" element={<Navigate to="/Erp_Mnmjec/home" />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="Erp_Mnmjec/home" element={<Home user={user} />} />


          {/* Protected routes */}
          {user && (
            <>
              <Route path="Erp_Mnmjec/dashboard" element={<Dashboard user={user} />} />
              <Route path="Erp_Mnmjec/students" element={<Students user={user} />} />
              <Route path="Erp_Mnmjec/faculty" element={<FacultyList user={user} />} />
              <Route path="Erp_Mnmjec/reports" element={<Reports user={user} />} />
              <Route path="Erp_Mnmjec/marks" element={<Marks user={user} />} />
              <Route path="Erp_Mnmjec/late" element={<Late user={user} />} />
              <Route path="Erp_Mnmjec/SecurityLateEntry" element={<SecurityLateEntry user={user} />} />

              {/* Attendance nested routes */}
              <Route path="Erp_Mnmjec/attendance" element={<Attendance user={user} />}>
                <Route
                  path="view"
                  element={user.role === 'student' ? <StudentAttendance user={user} /> : <PageNotFound />}
                />
                <Route
                  path="mark"
                  element={user.role !== 'student' ? <MarkAttendance user={user} /> : <PageNotFound />}
                />
                <Route
                  path="reports"
                  element={user.role !== 'student' ? <ReportsPage user={user} /> : <PageNotFound />}
                />
                <Route
                  path="manage"
                  element={user.role === 'HOD' ? <ManageStaff user={user} /> : <PageNotFound />}
                />
                <Route path="*" element={<PageNotFound />} />
              </Route>

              <Route path="Erp_Mnmjec/marks" element={<Marks user={user} />}>
                <Route path="enter" element={<EnterMarks />} />
                <Route path="view" element={<ViewMarks />} />
                <Route path="overview" element={<PrincipalOverview />} />
                <Route path="analysis" element={<DepartmentAnalysis />} />
                <Route path="top" element={<TopPerformers />} />
              </Route>

              <Route path="Erp_Mnmjec/fees" element={<Fees user={user} />}>
                <Route path="list" element={<FeesList user={user} />} />
                <Route path="student/:reg_no" element={<FeesStudentView user={user} />} />
                <Route path="analytics" element={<Feesanalytics user={user} />} />
                <Route path="add" element={<FeesAdd user={user} />} />
              </Route>


              <Route path="*" element={<PageNotFound />} />
            </>
          )}
        </Routes>
      </main>
      <footer className="py-3 text-center text-[11px] text-gray-500 bg-white select-none">
        <p className="leading-tight">
          © {new Date().getFullYear()} MNMJEC
        </p>
        <p className="mt-1 tracking-wide">
          Designed by{" "}
          <a
            href="https://portfolio.mrbi.live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 font-medium hover:text-black transition-colors"
          >
            Abinanthan&nbsp;V
          </a>{" "}
          <span className="opacity-70">· IV Year CSE, MNMJEC</span>
        </p>
      </footer>

    </div>
  );
}
