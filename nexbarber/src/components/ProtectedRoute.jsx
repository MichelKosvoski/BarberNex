import { Navigate } from "react-router-dom";
import { canAccessPainelFeature, getSessionUser } from "../services/api";

export default function ProtectedRoute({ children, allow, feature }) {
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.tipo)) {
    return <Navigate to="/" replace />;
  }

  if (feature && (user.tipo === "dono" || user.tipo === "funcionario")) {
    if (!canAccessPainelFeature(feature, user.plano)) {
      return <Navigate to="/painel/agenda" replace />;
    }
  }

  return children;
}
