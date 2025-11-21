import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import styles from "./Form.module.css"; // Reuse the styles

function CreatePlaylist() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);

    try {
      // Send POST request to the endpoint to create a playlist.
      await axios.post(
        "/api/playlists",
        { name },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // If it goes well, return to the Home page
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al crear la playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Nueva Playlist</h2>

      <form onSubmit={handleSubmit}>
        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre de la Playlist</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Música para programar"
            autoFocus // Auto focus on the input
          />
        </div>

        <button type="submit" className={styles.formButton} disabled={loading}>
          {loading ? "Creando..." : "Crear Playlist"}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylist;
