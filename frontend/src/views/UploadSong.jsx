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

function UploadSong() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [file, setFile] = useState(null); // Status for the file
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !artist || !file) {
      setError("Título, artista y archivo son obligatorios");
      return;
    }

    // Create a FormData object (necessary to send files)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("album", album || "Sencillo");
    formData.append("song", file); // 'song' must match upload.single('song') from the backend

    setLoading(true);

    try {
      // Send to the backend with the token

      await axios.post("/api/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ¡Importante para archivos!
          Authorization: `Bearer ${user.token}`,
        },
      });

      // If it goes well, return to the Home page
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al subir la canción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-lg shadow-lg border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Subir Música
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Añade tus archivos MP3 a la biblioteca pública
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center font-medium p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Billie Jean"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artista</Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ej. Michael Jackson"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Álbum (Opcional)</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Ej. Thriller"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Archivo MP3</Label>
              <Input
                id="file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="bg-background cursor-pointer file:text-primary file:font-medium"
              />
            </div>

            <div className="flex gap-3 pt-4">
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
                {loading ? "Subiendo..." : "Subir Canción"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadSong;
