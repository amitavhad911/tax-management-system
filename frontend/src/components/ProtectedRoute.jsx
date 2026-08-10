import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "./MainLayout";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

export default ProtectedRoute;
