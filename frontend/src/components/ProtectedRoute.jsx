import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // If user is logged in, show the content (Outlet)
  return user ? <Outlet /> : null;
};

export default ProtectedRoute;
