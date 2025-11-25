// this is a component from react
// is a function that returns JSX, Javascript + XLM (likes HTML)
// import the "hooks" we need
import React, { useState } from "react";
// "useNavigate" is the hook that allows us to redirect the user
import { useNavigate, Link } from "react-router-dom";
// import axios (our API "messenger")
import axios from "axios";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// UI Icons (For now only svg, soon i will use lucide-react for real icons)
const GoogleIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="google"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
  >
    <path
      fill="currentColor"
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    ></path>
  </svg>
);

function Register() {
  // created a "state variable" for each input.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex items-center justify-center min-h-[80vh] bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border bg-card text-card-foreground">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            Crea tu cuenta
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa tus datos para unirte a Spotify Clone
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Botón decorativo de Google */}
          <div className="grid grid-cols-1">
            <Button
              variant="outline"
              className="w-full bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
            >
              <GoogleIcon />
              Registrarse con Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O continúa con email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm text-center font-medium p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Register;
