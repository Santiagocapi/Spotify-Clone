import React, { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
// Import our hooks
import { useAuthContext } from "./context/AuthContext";
import Player from "./components/Player";
// Styles
import "./index.css";
import OurMusicLogo from "@/components/Logo";
// Shadcn Styles
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-background/80 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <OurMusicLogo className="fill-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            OurMusic
          </h1>
        </div>

        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Hola, <strong className="text-primary">{user.email}</strong>
              </span>

              <Link to="/upload">
                <Button variant="ghost" className="hover:bg-accent">
                  Subir Música
                </Button>
              </Link>

              <Link to="/create-playlist">
                <Button variant="ghost" className="hover:bg-accent">
                  Crear Playlist
                </Button>
              </Link>

              <Button onClick={handleLogout} variant="destructive" size="sm">
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-accent">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full px-8">Registrarse</Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-24">
        <Outlet />
      </main>

      <Player />
    </div>
  );
}

export default App;
