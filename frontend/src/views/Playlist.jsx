import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom"; // To read the id from the URL
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import styles from "./Home.module.css"; // Reuse the styles

function Playlist() {
  const { id } = useParams();
  const { user } = useAuthContext();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]); // Songs list and add songs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false); // To show/hide the panel to add songs

  // Function to upload files (playlist and all the songs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We make the GET request to our backend using populate to get the songs details
        const playlistRes = await axios.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(playlistRes.data);

        // We make the GET request to our backend to get all songs
        const songsRes = await axios.get("/api/songs");
        setAllSongs(songsRes.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user]);

  // Function to add songs to the playlist
  const handleAddSong = async (songId) => {
    try {
      // We make the GET request to our backend to add the song to the playlist
      const updatedPlaylistRes = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Update the playlist in the screen with the response from the server
      setPlaylist(updatedPlaylistRes.data);
      alert("Canción agregada con éxito");
    } catch (err) {
      alert(err.response?.data?.message || "Error al agregar canción");
    }
  };

  if (loading)
    return <div className={styles.loading}>Cargando playlist...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;
  if (!playlist)
    return <div className={styles.loading}>Playlist no encontrada</div>;

  // Filter songs to no repeat them
  const songsToAdd = allSongs.filter(
    (song) => !playlist.songs.some((pSong) => pSong._id === song._id)
  );

  return (
    <div className={styles.container}>
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#666",
          marginBottom: "20px",
          display: "block",
        }}
      >
        &larr; Volver al Inicio
      </Link>

      <div
        style={{
          marginBottom: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "10px", color: "#333" }}>
          {playlist.name}
        </h1>
        <p style={{ color: "#666" }}>{playlist.songs.length} Canciones</p>

        {/* Button to open the add menu */}
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: showAddSection ? "#ccc" : "#1db954",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showAddSection ? "Cerrar menú de agregar" : "Agregar Canciones"}
        </button>
      </div>

      {/* --- ADD MENU (visible if showAddSection is TRUE) --- */}
      {showAddSection && (
        <div
          style={{
            marginBottom: "40px",
            padding: "20px",
            backgroundColor: "#f1f1f1",
            borderRadius: "8px",
          }}
        >
          <h3>Canciones disponibles para agregar:</h3>
          <div className={styles.grid} style={{ marginTop: "15px" }}>
            {songsToAdd.length > 0 ? (
              songsToAdd.map((song) => (
                <div
                  key={song._id}
                  className={styles.card}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div className={styles.songTitle}>{song.title}</div>
                    <div className={styles.songArtist}>{song.artist}</div>
                  </div>
                  <button
                    onClick={() => handleAddSong(song._id)}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#1db954",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    + Añadir
                  </button>
                </div>
              ))
            ) : (
              <p>¡Ya has agregado todas las canciones disponibles!</p>
            )}
          </div>
        </div>
      )}
      {/* --- SONGS LIST --- */}
      <h3>Canciones en esta playlist:</h3>
      {/* Logic Empty State */}
      {playlist.songs.length === 0 ? (
        <p>Esta playlist está vacía.</p>
      ) : (
        <div className={styles.grid}>
          {playlist.songs.map((song) => (
            <div key={song._id} className={styles.card}>
              <div
                style={{
                  height: "120px",
                  background: "#eee",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                }}
              >
                🎵
              </div>
              <div className={styles.songTitle}>{song.title}</div>
              <div className={styles.songArtist}>{song.artist}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlist;
