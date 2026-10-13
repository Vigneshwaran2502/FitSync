import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Gracefully redirect the user to their own role dashboard rather than trapping on Access Restricted
    const userRole = user.role;
    const destination = userRole === "admin" 
      ? "/admin/dashboard" 
      : userRole === "trainer" 
        ? "/trainer/dashboard" 
        : (user.onboardingCompleted === false ? "/member/onboarding" : "/member/dashboard");
    return <Navigate to={destination} replace />;
  }

  return children;
};

export { RoleRoute };
