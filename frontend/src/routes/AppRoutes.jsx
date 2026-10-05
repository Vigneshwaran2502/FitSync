import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { AppLayout } from "../layouts/AppLayout";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { Unauthorized, NotFound } from "../pages/auth/Unauthorized";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminMemberships } from "../pages/admin/AdminMemberships";
import { AdminSubscriptions } from "../pages/admin/AdminSubscriptions";
import { AdminAttendance } from "../pages/admin/AdminAttendance";
import { AdminQRScreen } from "../pages/admin/AdminQRScreen";
import { AdminWorkouts } from "../pages/admin/AdminWorkouts";
import { AdminAppointments } from "../pages/admin/AdminAppointments";
import { AdminReports } from "../pages/admin/AdminReports";
import { AdminNotifications } from "../pages/admin/AdminNotifications";
import { AdminSettings } from "../pages/admin/AdminSettings";
import { TrainerDashboard } from "../pages/trainer/TrainerDashboard";
import { TrainerMembers } from "../pages/trainer/TrainerMembers";
import { TrainerWorkoutPlans } from "../pages/trainer/TrainerWorkoutPlans";
import { TrainerExercises } from "../pages/trainer/TrainerExercises";
import { TrainerAppointments } from "../pages/trainer/TrainerAppointments";
import { TrainerAvailability } from "../pages/trainer/TrainerAvailability";
import { TrainerMemberProgress } from "../pages/trainer/TrainerMemberProgress";
import { TrainerProfilePage } from "../pages/trainer/TrainerProfile";
import { MemberOnboarding } from "../pages/member/MemberOnboarding";
import { MemberDashboard } from "../pages/member/MemberDashboard";
import { MemberProfile } from "../pages/member/MemberProfile";
import { MemberMembership } from "../pages/member/MemberMembership";
import { MemberWorkouts } from "../pages/member/MemberWorkouts";
import { MemberWorkoutHistory } from "../pages/member/MemberWorkoutHistory";
import { MemberAttendance } from "../pages/member/MemberAttendance";
import { MemberProgress } from "../pages/member/MemberProgress";
import { MemberAppointments } from "../pages/member/MemberAppointments";
import { MemberNotifications } from "../pages/member/MemberNotifications";
import { MemberSettings } from "../pages/member/MemberSettings";
import { LandingPage } from "../pages/public/LandingPage";
import { AICoachPage } from "../pages/common/AICoachPage";
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "trainer") return <Navigate to="/trainer/dashboard" replace />;
  if (user.onboardingCompleted === false) return <Navigate to="/member/onboarding" replace />;
  return <Navigate to="/member/dashboard" replace />;
};
const AppRoutes = () => {
  return <Routes>
      {
    /* Public Landing Page */
  }
      <Route path="/" element={<LandingPage />} />
      <Route path="/portal" element={<RootRedirect />} />
      <Route path="/app" element={<RootRedirect />} />

      {
    /* Public Auth Routes */
  }
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {
    /* Member Onboarding Flow */
  }
      <Route
    path="/member/onboarding"
    element={<ProtectedRoute>
            <RoleRoute allowedRoles={["member"]}>
              <MemberOnboarding />
            </RoleRoute>
          </ProtectedRoute>}
  />

      {
    /* ADMIN PORTAL (Protected + Role Admin) */
  }
      <Route
    path="/admin"
    element={<ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AppLayout />
            </RoleRoute>
          </ProtectedRoute>}
  >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ai-assistant" element={<AICoachPage />} />
        <Route path="members" element={<AdminUsers defaultRole="member" />} />
        <Route path="trainers" element={<AdminUsers defaultRole="trainer" />} />
        <Route path="memberships" element={<AdminMemberships />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="attendance/qr" element={<AdminQRScreen />} />
        <Route path="workouts" element={<AdminWorkouts />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {
    /* TRAINER PORTAL (Protected + Role Trainer) */
  }
      <Route
    path="/trainer"
    element={<ProtectedRoute>
            <RoleRoute allowedRoles={["trainer"]}>
              <AppLayout />
            </RoleRoute>
          </ProtectedRoute>}
  >
        <Route index element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="ai-assistant" element={<AICoachPage />} />
        <Route path="members" element={<TrainerMembers />} />
        <Route path="workout-plans" element={<TrainerWorkoutPlans />} />
        <Route path="exercises" element={<TrainerExercises />} />
        <Route path="appointments" element={<TrainerAppointments />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="progress" element={<TrainerMemberProgress />} />
        <Route path="availability" element={<TrainerAvailability />} />
        <Route path="profile" element={<TrainerProfilePage />} />
        <Route path="notifications" element={<MemberNotifications />} />
      </Route>

      {
    /* MEMBER PORTAL (Protected + Role Member) */
  }
      <Route
    path="/member"
    element={<ProtectedRoute>
            <RoleRoute allowedRoles={["member"]}>
              <AppLayout />
            </RoleRoute>
          </ProtectedRoute>}
  >
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="ai-assistant" element={<AICoachPage />} />
        <Route path="profile" element={<MemberProfile />} />
        <Route path="membership" element={<MemberMembership />} />
        <Route path="workouts" element={<MemberWorkouts />} />
        <Route path="workout-history" element={<MemberWorkoutHistory />} />
        <Route path="attendance" element={<MemberAttendance />} />
        <Route path="progress" element={<MemberProgress />} />
        <Route path="appointments" element={<MemberAppointments />} />
        <Route path="notifications" element={<MemberNotifications />} />
        <Route path="settings" element={<MemberSettings />} />
      </Route>

      {
    /* 404 Fallback */
  }
      <Route path="*" element={<NotFound />} />
    </Routes>;
};
export {
  AppRoutes
};
