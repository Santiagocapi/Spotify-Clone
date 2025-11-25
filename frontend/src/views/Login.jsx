import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// Import our custom hook
import { useAuthContext } from "../context/AuthContext.jsx";

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

function Login() {
  // Local state (memory) ONLY for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex items-center justify-center min-h-[80vh] bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-border bg-card text-card-foreground">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            Bienvenido de nuevo
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa tus credenciales para acceder a tu música
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center font-medium p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-input focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {/* Enlace decorativo */}
                <Link
                  to="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-input focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold rounded-full mt-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
