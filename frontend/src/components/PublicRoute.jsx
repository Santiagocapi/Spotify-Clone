import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { user } = useAuthContext();

  // If user is logged in, redirect to home
  // If user is not logged in, show the content (Outlet)
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
