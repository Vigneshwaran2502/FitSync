import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoutes';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';

import AdminDashboard from './pages/admin/Dashboard';
import TrainerDashboard from './pages/trainer/Dashboard';
import MemberDashboard from './pages/member/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              
              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {/* More Admin Routes */}
              </Route>

              {/* Trainer Routes */}
              <Route element={<RoleRoute allowedRoles={['trainer']} />}>
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                {/* More Trainer Routes */}
              </Route>

              {/* Member Routes */}
              <Route element={<RoleRoute allowedRoles={['member']} />}>
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                {/* More Member Routes */}
              </Route>

            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
  );
}

export default App;
