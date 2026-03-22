import { Navigate } from "react-router-dom";
import { getSessionUser } from "../services/api";

export default function ProtectedRoute({ children, allow }) {
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.tipo)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
