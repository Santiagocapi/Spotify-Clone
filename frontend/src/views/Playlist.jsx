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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        // We make the GET request to our backend using populate to get the songs details
        const response = await axios.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(response.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlaylist();
    }
  }, [id, user]);

  if (loading)
    return <div className={styles.loading}>Cargando playlist...</div>;
  if (error) return <div className={styles.loading}>{error}</div>;
  if (!playlist)
    return <div className={styles.loading}>Playlist no encontrada</div>;
  if (playlist.songs.lenght === 0)
    return <div className={styles.loading}>Playlist vacia</div>;

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
        <p style={{ color: "#666" }}>
          Creada por ti • {playlist.songs.length}{" "}
          {playlist.songs.length === 1 ? "canción" : "canciones"}
        </p>
      </div>

      {/* Logic Empty State */}
      {playlist.songs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
            padding: "40px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#555", marginBottom: "10px" }}>
            Esta playlist está vacía
          </h3>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            ¡Busca canciones en el inicio y agrégalas aquí!
          </p>
          <Link
            to="/"
            style={{
              backgroundColor: "#1db954",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Explorar Canciones
          </Link>
        </div>
      ) : (
        /* Songs Grid if not empty */
        <div className={styles.grid}>
          {playlist.songs.map((song) => (
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
              {/* Aquí podríamos agregar un botón de "Reproducir" más adelante */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlist;
