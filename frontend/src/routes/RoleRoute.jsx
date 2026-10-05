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
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};
export {
  RoleRoute
};
