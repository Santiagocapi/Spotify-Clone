// this is a component from react
// is a function that returns JSX, Javascript + XLM (likes HTML)
// import the "hooks" we need
import React, { useState } from "react";
// "useNavigate" is the hook that allows us to redirect the user
import { useNavigate } from "react-router-dom";

// import axios (our API "messenger")
import axios from "axios";

// import our "scoped" styles (CSS Modules)
import styles from "./Form.module.css";

function Register() {
  // created a "state variable" for each input.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // initialize the "redirector"
  const navigate = useNavigate();

  // this function will be called when the form is submitted
  const handleSubmit = async (e) => {
    // prevent the browser from reloading the page
    e.preventDefault();
    setError(null);

    // simple validation on the frontend
    if (!username || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // using Axios
    // making a POST request to our backend
    // '/api/users/register' becomes 'http://localhost:3000/api/users/register'
    try {
      const userData = {
        username: username,
        email: email,
        password: password,
      };

      // calling the api
      const response = await axios.post("/api/users/register", userData);
      console.log("Usuario registrado:", response.data);

      // we redirect the user to the login page using navigate
      navigate("/login");
    } catch (apiError) {
      setError(apiError.response.data.message || "Error al registrarse");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.formError}>{error}</p>}

        {/* input from username */}
        <div className={styles.formGroup}>
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            // We call 'setUsername' to update the state, which causes the component to re-render.
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* input from email */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* input from password */}
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
          Registrarse
        </button>

        {/* the <Link> component belongs to the router, it's a <a> that doesn't reload the page */}
        <Link to="/login" className={styles.formLink}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  );
}

export default Register;
