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
import MembersList from './pages/admin/MembersList';
import TrainersList from './pages/admin/TrainersList';
import MembershipPlansList from './pages/admin/MembershipPlansList';
import SubscriptionsList from './pages/admin/SubscriptionsList';
import AppointmentsList from './pages/admin/AppointmentsList';
import AttendanceList from './pages/admin/AttendanceList';
import ProgressList from './pages/admin/ProgressList';
import NotificationsList from './pages/admin/NotificationsList';

import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerMembersList from './pages/trainer/MembersList';
import { 
  TrainerWorkoutsList, 
  TrainerExercisesList, 
  TrainerAppointmentsList, 
  TrainerAvailability, 
  TrainerProgressList, 
  TrainerProfile 
} from './pages/trainer/Placeholders';

import MemberDashboard from './pages/member/Dashboard';
import MemberWorkouts from './pages/member/Workouts';
import {
  MemberMembership,
  MemberAttendance,
  MemberProgress,
  MemberGoals,
  MemberAppointments,
  MemberProfile
} from './pages/member/Placeholders';

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
                <Route path="/admin/members" element={<MembersList />} />
                <Route path="/admin/trainers" element={<TrainersList />} />
                <Route path="/admin/membership-plans" element={<MembershipPlansList />} />
                <Route path="/admin/subscriptions" element={<SubscriptionsList />} />
                <Route path="/admin/appointments" element={<AppointmentsList />} />
                <Route path="/admin/attendance" element={<AttendanceList />} />
                <Route path="/admin/progress" element={<ProgressList />} />
                <Route path="/admin/notifications" element={<NotificationsList />} />
              </Route>

              {/* Trainer Routes */}
              <Route element={<RoleRoute allowedRoles={['trainer']} />}>
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                <Route path="/trainer/members" element={<TrainerMembersList />} />
                <Route path="/trainer/workouts" element={<TrainerWorkoutsList />} />
                <Route path="/trainer/exercises" element={<TrainerExercisesList />} />
                <Route path="/trainer/appointments" element={<TrainerAppointmentsList />} />
                <Route path="/trainer/availability" element={<TrainerAvailability />} />
                <Route path="/trainer/progress" element={<TrainerProgressList />} />
                <Route path="/trainer/notifications" element={<NotificationsList />} />
                <Route path="/trainer/profile" element={<TrainerProfile />} />
              </Route>

              {/* Member Routes */}
              <Route element={<RoleRoute allowedRoles={['member']} />}>
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/membership" element={<MemberMembership />} />
                <Route path="/member/workouts" element={<MemberWorkouts />} />
                <Route path="/member/attendance" element={<MemberAttendance />} />
                <Route path="/member/progress" element={<MemberProgress />} />
                <Route path="/member/goals" element={<MemberGoals />} />
                <Route path="/member/appointments" element={<MemberAppointments />} />
                <Route path="/member/notifications" element={<NotificationsList />} />
                <Route path="/member/profile" element={<MemberProfile />} />
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
