import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();
  const roles = allowedRoles.map((role) => role.toLowerCase());

  if (!roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;