import React from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const playlistSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

function CreatePlaylist() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(playlistSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post(
        "/api/playlists",
        data,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success("Playlist creada exitosamente");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error al crear la playlist");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-lg border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Nueva Playlist
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Dale un nombre a tu nueva colección de canciones
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Ej. Música para programar"
                autoFocus
                className={cn("bg-background focus:ring-primary", errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Link to="/" className="w-1/2">
                <Button variant="outline" className="w-full" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="w-1/2 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crear Playlist"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePlaylist;
