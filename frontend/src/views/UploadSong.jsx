import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

function UploadSong() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [file, setFile] = useState(null); // Status for the file
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !artist || !file) {
      setError("Título, artista y archivo son obligatorios");
      return;
    }

    // Create a FormData object (necessary to send files)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("album", album || "Sencillo");
    formData.append("song", file); // 'song' must match upload.single('song') from the backend

    setLoading(true);

    try {
      // Send to the backend with the token

      await axios.post("/api/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ¡Importante para archivos!
          Authorization: `Bearer ${user.token}`,
        },
      });

      // If it goes well, return to the Home page
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al subir la canción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Subir Canción</h2>

      <form onSubmit={handleSubmit}>
        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Billie Jean"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="artist">Artista</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Ej. Michael Jackson"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="album">Álbum (Opcional)</label>
          <input
            type="text"
            id="album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Ej. Thriller"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="file">Archivo MP3</label>
          <input
            type="file"
            id="file"
            accept="audio/*" // Solo acepta audio
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          className={styles.formButton}
          disabled={loading} // Deshabilita el botón mientras sube
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Subiendo..." : "Subir Canción"}
        </button>
      </form>
    </div>
  );
}

export default UploadSong;
