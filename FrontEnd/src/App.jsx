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

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
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

            <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] w-full ml-[250px]">
              <div className="flex-1 p-6 relative">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/housekeeping" element={<Housekeeping />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/ads" element={<Ads />} />
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
