import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

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

const registerSchema = z.object({
  username: z.string().min(2, "El usuario debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

function Register() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await api.post("/api/users/register", data);
      toast.success("Cuenta creada exitosamente");
      navigate("/login");
    } catch (apiError) {
      const msg = apiError.response?.data?.message || "Error al registrarse";
      setError(msg);
      toast.error(msg);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register("username")}
                className={cn("bg-background border-input", errors.username && "border-destructive")}
              />
              {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                {...register("email")}
                className={cn("bg-background border-input", errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={cn("bg-background border-input", errors.password && "border-destructive")}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarse"}
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
