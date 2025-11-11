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
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          {user && (
            <>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/students" element={<Students user={user} />} />
              <Route path="/faculty" element={<FacultyList user={user} />} />
              <Route path="/reports" element={<Reports user={user} />} />
              <Route path="/marks" element={<Marks user={user} />} />
              <Route path="/late" element={<Late user={user} />} />
              <Route path="/SecurityLateEntry" element={<SecurityLateEntry user={user} />} />

              {/* Attendance nested routes */}
              <Route path="/attendance" element={<Attendance user={user} />}>
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

              <Route path="/marks" element={<Marks user={user} />}>
                <Route path="enter" element={<EnterMarks />} />
                <Route path="view" element={<ViewMarks />} />
                <Route path="overview" element={<PrincipalOverview />} />
                <Route path="analysis" element={<DepartmentAnalysis />} />
                <Route path="top" element={<TopPerformers />} />
              </Route>


              {/* Catch-all for unknown routes */}
              <Route path="*" element={<PageNotFound />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
