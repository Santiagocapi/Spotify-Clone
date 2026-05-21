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
import { Music, Heart, Sparkles } from "lucide-react";

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
    <div className="flex min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background animate-in fade-in duration-500">
      {/* LEFT VISUAL PANE (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary/10 to-accent/30 dark:from-primary/5 dark:to-accent/15 text-foreground relative overflow-hidden border-r border-border/40">
        {/* Decorative elements */}
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 dark:bg-accent/20 blur-3xl" />
        
        {/* Top brand tagline */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase opacity-85">
            Sincroniza tus sentidos
          </span>
        </div>

        {/* Center welcome text */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Únete a la mejor biblioteca de música.
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Crea tu cuenta de forma gratuita en cuestión de segundos y comienza a subir tus propios álbumes, crear playlists temáticas e interactuar con la interfaz en modo claro u oscuro.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 text-xs font-semibold">
              <Music className="h-3.5 w-3.5 text-primary" />
              Sube tus canciones
            </div>
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 text-xs font-semibold">
              <Heart className="h-3.5 w-3.5 text-primary fill-primary/20" />
              Guarda tus favoritos
            </div>
          </div>
        </div>

        {/* Bottom copyright/notes */}
        <div className="relative z-10 text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} OurMusic App. Todos los derechos reservados.
        </div>
      </div>

      {/* RIGHT FORM PANE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Crear Cuenta
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Completa los datos solicitados para registrarte.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center font-semibold p-3.5 rounded-xl border border-destructive/20 animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                placeholder="Ej. santidrummer"
                {...register("username")}
                className={cn(
                  "h-11 rounded-full bg-background border-border hover:bg-muted/40 focus:ring-primary transition-all px-4",
                  errors.username && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.username && (
                <p className="text-destructive text-xs font-semibold px-2">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                {...register("email")}
                className={cn(
                  "h-11 rounded-full bg-background border-border hover:bg-muted/40 focus:ring-primary transition-all px-4",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-semibold px-2">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
                className={cn(
                  "h-11 rounded-full bg-background border-border hover:bg-muted/40 focus:ring-primary transition-all px-4",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.password && (
                <p className="text-destructive text-xs font-semibold px-2">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold rounded-full h-11 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>

          <div className="border-t border-border/60 pt-6 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-bold transition-all"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
