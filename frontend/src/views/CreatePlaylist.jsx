import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center font-medium p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Música para programar"
                autoFocus
                className="bg-background focus:ring-primary"
              />
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
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Playlist"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePlaylist;
