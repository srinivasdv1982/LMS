import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Employees from './features/employees/Employees';
import Housekeeping from './features/housekeeping/Housekeeping';
import Inventory from './features/inventory/Inventory';
import Attendance from './features/attendance/Attendance';
import Reports from './features/reports/Reports';
import News from './features/news/News';
import Ads from './features/ads/Ads';
import Rooms from './features/rooms/Rooms';

import Users from './features/users/Users';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not in the allowed roles list, redirect to a safe default (like dashboard)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    toast.error('You do not have permission to access that page');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Define constants for role lists to keep code clean
const ROLES = {
  ALL: ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'StoreKeeper'],
  ADMIN_ONLY: ['Admin'],
  MANAGER_ABOVE: ['Admin', 'Manager'],
  INVENTORY_ACCESS: ['Admin', 'Manager', 'StoreKeeper'],
  HOUSEKEEPING_ACCESS: ['Admin', 'Manager', 'Housekeeping'],
  FRONTDESK_ACCESS: ['Admin', 'Manager', 'Receptionist'],
};

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      {!token ? (
        <div className="min-h-screen bg-[#f4f6f9] text-slate-800 font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen bg-[#f4f6f9] text-slate-800 font-sans">
          <Header />

          <div className="flex flex-1 pt-16">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] ml-[250px]">
              <div className="flex-1 p-6 relative">
                <Routes>
                  {/* Dashboard - All Roles */}
                  <Route path="/" element={
                    <RoleProtectedRoute allowedRoles={ROLES.ALL}><Dashboard /></RoleProtectedRoute>
                  } />

                  {/* Rooms - Admin, Manager, Receptionist */}
                  <Route path="/rooms" element={
                    <RoleProtectedRoute allowedRoles={ROLES.FRONTDESK_ACCESS}><Rooms /></RoleProtectedRoute>
                  } />

                  {/* Employees - Admin, Manager */}
                  <Route path="/employees" element={
                    <RoleProtectedRoute allowedRoles={ROLES.MANAGER_ABOVE}><Employees /></RoleProtectedRoute>
                  } />

                  {/* Users (Admin Only) */}
                  <Route path="/users" element={
                    <RoleProtectedRoute allowedRoles={ROLES.ADMIN_ONLY}><Users /></RoleProtectedRoute>
                  } />

                  {/* Housekeeping - Admin, Manager, Housekeeping */}
                  <Route path="/housekeeping" element={
                    <RoleProtectedRoute allowedRoles={ROLES.HOUSEKEEPING_ACCESS}><Housekeeping /></RoleProtectedRoute>
                  } />

                  {/* Inventory - Admin, Manager, StoreKeeper */}
                  <Route path="/inventory" element={
                    <RoleProtectedRoute allowedRoles={ROLES.INVENTORY_ACCESS}><Inventory /></RoleProtectedRoute>
                  } />

                  {/* Attendance - Admin, Manager, Receptionist */}
                  <Route path="/attendance" element={
                    <RoleProtectedRoute allowedRoles={ROLES.FRONTDESK_ACCESS}><Attendance /></RoleProtectedRoute>
                  } />

                  {/* Reports - Admin, Manager */}
                  <Route path="/reports" element={
                    <RoleProtectedRoute allowedRoles={ROLES.MANAGER_ABOVE}><Reports /></RoleProtectedRoute>
                  } />

                  {/* News - Admin, Manager */}
                  <Route path="/news" element={
                    <RoleProtectedRoute allowedRoles={ROLES.ADMIN_ONLY}><News /></RoleProtectedRoute>
                  } />

                  {/* Ads - Admin, Manager */}
                  <Route path="/ads" element={
                    <RoleProtectedRoute allowedRoles={ROLES.ADMIN_ONLY}><Ads /></RoleProtectedRoute>
                  } />

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
              <Footer />
            </main>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
