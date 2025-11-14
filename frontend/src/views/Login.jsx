import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Form.module.css"; // We reuse the same styles

// Import our custom hook
import { useAuthContext } from "../context/AuthContext.jsx";

function Login() {
  // Local state (memory) ONLY for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { dispatch } = useAuthContext();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const userData = { email, password };

      // Call the LOGIN endpoint
      const response = await axios.post("/api/users/login", userData);

      // response.data will be the object { _id, username, email, token }
      const user = response.data;

      // This is so you stay logged in if you reload the page
      localStorage.setItem("user", JSON.stringify(user));

      // We send the LOGIN "action" to our reducer.
      dispatch({ type: "LOGIN", payload: user });

      // Back to 'Home'
      navigate("/");
    } catch (apiError) {
      setError(apiError.response.data.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Iniciar Sesión</h2>

      <form onSubmit={handleSubmit}>
        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.formButton}>
          Entrar
        </button>
      </form>

      <Link to="/register" className={styles.formLink}>
        ¿No tienes cuenta? Regístrate
      </Link>
    </div>
  );
}

export default Login;
