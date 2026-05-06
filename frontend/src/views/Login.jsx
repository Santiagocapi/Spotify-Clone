import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

function Login() {
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      const response = await api.post("/api/users/login", data);
      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });
      navigate("/");
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      toast.error(msg);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register("email")}
                className={cn("bg-background border-input focus:ring-primary", errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={cn("bg-background border-input focus:ring-primary", errors.password && "border-destructive")}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full font-bold rounded-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Iniciar Sesión"}
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
