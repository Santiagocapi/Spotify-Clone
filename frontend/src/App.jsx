import React, { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
// Import our hooks
import { useAuthContext } from "./context/AuthContext";
import Player from "./components/Player";
import "./index.css";

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
    <div>
      <header className="app-header">
        <h1>Spotify Clone</h1>

        {/* Conditional Render */}
        <nav style={{ marginTop: "10px" }}>
          {user ? (
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span>
                Hola, <strong>{user.email}</strong>
              </span>
              <Link
                to="/upload"
                style={{
                  padding: "3px 8px",
                  cursor: "pointer",
                  textDecoration: "none",
                  background: "#1db954",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                Subir Música
              </Link>
              <Link
                to="/create-playlist"
                style={{
                  marginRight: "20px",
                  color: "#1db954",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Crear Playlist
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  background: "#ff5555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", gap: "20px", justifyContent: "center" }}
            >
              <Link to="/login">Iniciar Sesión</Link>
              <Link to="/register">Registrarse</Link>
            </div>
          )}
        </nav>
      </header>

      <main className="main-content" style={{ paddingBottom: "100px" }}>
        <Outlet />
      </main>

      {/* It will only be displayed if a song is selected (logic within Player) */}
      <Player />
    </div>
  );
}

export default App;
