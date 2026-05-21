import React, { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
// Import our hooks
import { useAuthContext } from "./context/AuthContext";
// Styles
import "./index.css";

// Components
import Player from "@/components/Player";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import QueueSidebar from "@/components/QueueSidebar";

function App() {
  const { user, dispatch } = useAuthContext();
  const navigate = useNavigate();

  // Debug: Log user state changes
  useEffect(() => {
    console.log("Estado de usuario en App cambió:", user);
  }, [user]);

  // Function to handle logout
  const handleLogout = () => {
    // Remove user from local storage
    localStorage.removeItem("user");

    // Dispatch logout action
    dispatch({ type: "LOGOUT" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground font-sans overflow-hidden relative">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
        <Header />
        {/* MAIN CONTENT */}
        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 scroll-smooth">
            <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
              <Outlet />
            </div>
          </main>
        </div>
        
        {/* PLAYER */}
        <Player />
      </div>

      {/* QUEUE SIDEBAR */}
      <QueueSidebar />

      {/* Toast for notifications */}
      <Toaster />
    </div>
  );
}

export default App;
