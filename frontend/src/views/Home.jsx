import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";
// Import the context to obtain the token
import { useAuthContext } from "../context/AuthContext";

function Home() {
  // State to save the songs and playlists we bring from the backend
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  // Status to know if we are loading
  const [loading, setLoading] = useState(true);
  // State to save errors if something goes wrong
  const [error, setError] = useState(null);

  // We use the context to obtain the user token
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We make the GET request to our backend
        const songRes = await axios.get("/api/songs");
        setSongs(songRes.data);

        const playlistsRes = await axios.get("/api/playlists/my", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPlaylists(playlistsRes.data);
      } catch (err) {
        console.error("Error al cargar canciones", err);
        setError("No se pudieron cargar las canciones");
      } finally {
        setLoading(false);
      }
    };
    // We only attempt to load if there is a user (although ProtectedRoute already ensures this)
    if (user) {
      fetchData();
    }
  }, [user]); // Run when user loads

  if (loading) return <div className={styles.loading}>Cargando música...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;

  return (
    <div className={styles.container}>
      {/* Playlists Section */}
      <h2 className={styles.title}>Mis Playlists</h2>
      <div className={styles.grid} style={{ marginBottom: "40px" }}>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <Link
              to={`/playlist/${playlist._id}`}
              key={playlist._id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                key={playlist._id}
                className={styles.card}
                style={{ backgroundColor: "#e6f7ff" }}
              >
                <div
                  style={{
                    height: "100px",
                    background: "#b3e0ff",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                  }}
                >
                  💿
                </div>
                <div className={styles.songTitle}>{playlist.name}</div>
                <div className={styles.songArtist}>
                  {playlist.songs.length} canciones
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No tienes playlists creadas aún.</p>
        )}
      </div>

      {/* Songs Section */}
      <h2 className={styles.title}>Canciones Disponibles</h2>
      <div className={styles.grid}>
        {songs.map((song) => (
          <div key={song._id} className={styles.card}>
            <div
              style={{
                height: "150px",
                background: "#eee",
                marginBottom: "10px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              🎵
            </div>
            <div className={styles.songTitle}>{song.title}</div>
            <div className={styles.songArtist}>{song.artist}</div>
          </div>
        ))}
      </div>

      {songs.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No hay canciones disponibles.
        </p>
      )}
    </div>
  );
}

export default Home;
