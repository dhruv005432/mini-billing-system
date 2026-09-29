import { Navigate } from "react-router-dom";
import { useBilling } from "../../context";

function ProtectedRoute({ children }) {
  const { currentUser } = useBilling();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
