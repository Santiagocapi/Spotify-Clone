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

  // State to show the modal and the song to add
  const [showModal, setShowModal] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

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

  // Function to open the modal
  const openAddModal = (song) => {
    setSongToAdd(song);
    setShowModal(true);
  };

  // Call the API to add songs
  const handleAddToPlaylist = async (playlistId) => {
    try {
      await axios.put(
        `/api/playlists/${playlistId}/add`,
        { songId: songToAdd._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`¡"${songToAdd.title}" agregada a la playlist!`);
      setShowModal(false); // Close modal
      setSongToAdd(null); // Clean selection
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al agregar la canción");
    }
  };

  if (loading) return <div className={styles.loading}>Cargando música...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;

  return (
    <div className={styles.container}>
      {/* PLAYLIST SECTION */}
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

      {/* SONGS SECTION */}
      <h2 className={styles.title}>Canciones Disponibles</h2>
      <div className={styles.grid}>
        {songs.map((song) => (
          <div key={song._id} className={styles.card}>
            <button
              onClick={(e) => {
                e.preventDefault();
                openAddModal(song);
              }}
              className={styles.addButton}
              title="Agregar a una playlist"
            >
              +
            </button>
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

      {/* --- MODAL SECTION (popup window) --- */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "400px",
              maxWidth: "90%",
              position: "relative",
            }}
          >
            <h3 style={{ marginBottom: "20px" }}>
              Agregar "{songToAdd?.title}" a...
            </h3>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                margin: "20px 0",
                border: "1px solid #eee",
                borderRadius: "5px",
              }}
            >
              {playlists.length > 0 ? (
                playlists.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleAddToPlaylist(p._id)}
                    style={{
                      padding: "15px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9f9f9")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <span style={{ fontWeight: "bold" }}>{p.name}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      {p.songs.length} canciones
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  No tienes playlists. ¡Crea una primero!
                </p>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                background: "#ccc",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
