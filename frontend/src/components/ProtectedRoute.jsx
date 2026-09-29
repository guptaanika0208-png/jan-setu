import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-setu-bg">
        <div className="h-10 w-10 rounded-full border-4 border-setu-blue-light border-t-setu-blue animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
