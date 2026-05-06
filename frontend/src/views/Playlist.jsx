import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthContext } from "../context/AuthContext";
import { useRecentPlaylists } from "../hooks/useRecentPlaylists";
import { usePlayer } from "../context/PlayerContext";
import { cn, formatTime } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  Trash2,
  Clock3,
  Music,
  PlayCircle,
  Edit2,
  Camera,
  Heart,
} from "lucide-react";

function Playlist() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { addRecent } = useRecentPlaylists();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);

  // Edition states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playlistRes = await api.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(playlistRes.data);
        addRecent(playlistRes.data);
        setEditName(playlistRes.data.name);
        setEditDesc(playlistRes.data.description || "");

        const songsRes = await api.get("/api/songs");
        setAllSongs(songsRes.data);

        try {
          const userLikesRes = await api.get("/api/users/liked", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (Array.isArray(userLikesRes.data)) {
            const ids = userLikesRes.data.map((s) => s._id);
            setLikedSongs(ids);
          } else {
            setLikedSongs([]);
          }
        } catch (likeError) {
          setLikedSongs([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [id, user]);

  // Update playlist
  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("description", editDesc);
    if (editFile) formData.append("coverImage", editFile);

    try {
      const res = await api.put(`/api/playlists/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPlaylist(res.data);
      setIsEditOpen(false);
      toast.success("Playlist actualizada");
    } catch (err) {
      toast.error("Error al actualizar playlist");
    } finally {
      setIsSaving(false);
    }
  };

  // Add song to playlist
  const handleAddSong = async (songId) => {
    try {
      await api.put(
        `/api/playlists/${id}/add`,
        { songId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      toast.success("Canción añadida correctamente");
      const res = await api.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPlaylist(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al añadir la canción");
    }
  };

  // Remove song from playlist
  const handleRemoveSong = async (songId) => {
    toast.promise(
      async () => {
        await api.put(
          `/api/playlists/${id}/remove`,
          { songId },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );
        const res = await api.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(res.data);
      },
      {
        loading: "Eliminando canción...",
        success: "Canción eliminada de la playlist",
        error: "Error al eliminar la canción",
      },
    );
  };

  // Delete playlist
  const handleDeletePlaylist = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta playlist entera?"))
      return;
    try {
      await api.delete(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/");
      toast.success("Playlist eliminada");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al eliminar playlist");
    }
  };

  // Like songs
  const handleLike = async (songId) => {
    try {
      await api.put(
        `/api/users/like/${songId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      if (likedSongs.includes(songId)) {
        setLikedSongs(likedSongs.filter((lid) => lid !== songId));
      } else {
        setLikedSongs([...likedSongs, songId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

if (loading)
    return (
      <div className="space-y-6 p-6">
        <div className="flex gap-6 items-end">
          <Skeleton className="h-52 w-52 rounded-lg" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-destructive">{error}</div>;
  if (!playlist) return <div className="p-10 text-center">No encontrada</div>;

  const songsToAdd = allSongs.filter((s) => {
    if (!playlist.songs) return true;
    return !playlist.songs.some((item) => {
      if (!item.song && !item._id) return false;
      const itemId = item.song ? item.song._id || item.song : item._id;
      return itemId === s._id;
    });
  });

  // Clean playlist songs
  const playlistSongs = playlist.songs
    .map((item) => item.song || item)
    .filter((song) => song && song.title);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-gradient-to-br from-secondary to-accent p-6 rounded-xl">
        <div
          className="group relative flex h-52 w-52 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-xl cursor-pointer bg-card border-4 border-background"
          onClick={() => setIsEditOpen(true)}
        >
          {playlist.coverImagePath ? (
            <img
              src={`http://localhost:3000/${playlist.coverImagePath.replace(/\\/g, "/")}`}
              alt={playlist.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/50">
              <Music className="h-20 w-20 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <Camera className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Editar foto</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Playlist
            </h5>
            <h1
              className="text-4xl font-black tracking-tight sm:text-6xl hover:underline cursor-pointer decoration-primary decoration-4 text-foreground"
              onClick={() => setIsEditOpen(true)}
            >
              {playlist.name}
            </h1>
            <p className="text-muted-foreground pt-4 text-sm font-medium">
              {playlist.description || "Sin descripción"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span className="text-foreground">Tu Playlist</span>
            <span>•</span>
            <span>{playlistSongs.length} canciones</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-between px-4">
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAddSection(!showAddSection)}
            className="rounded-full px-8 font-bold"
            size="lg"
          >
            {showAddSection ? "Listo" : "Añadir canciones"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            title="Editar detalles"
          >
            <Edit2 className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleDeletePlaylist}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            title="Eliminar Playlist"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* ADD SONG PANEL */}
      {showAddSection && (
        <Card className="border-dashed bg-muted/30 mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Canciones sugeridas</h3>
            {songsToAdd.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {songsToAdd.map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center justify-between rounded-md border bg-card p-2 shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Music className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <div className="truncate font-medium">{song.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {song.artist}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddSong(song._id)}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      Añadir
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay más canciones disponibles para agregar.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* SONGS TABLE */}
      {playlist.songs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Álbum</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  <Clock3 className="h-4 w-4 ml-auto" />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlist.songs.map((item, index) => {
                let song = item.song || item;

                if (!song || !song._id) return null;

                const isCurrentSong = currentSong?._id === song._id;

                return (
                  <TableRow key={song._id} className="group h-16">
                    <TableCell className="font-medium text-muted-foreground text-center relative">
                      <span
                        className={cn(
                          "group-hover:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                          isCurrentSong && "text-primary",
                        )}
                      >
                        {index + 1}
                      </span>
                      <button
                        onClick={() => playSong(song, playlistSongs)}
                        className="hidden group-hover:flex absolute inset-0 items-center justify-center text-primary"
                      >
                        <PlayCircle
                          className={cn(
                            "h-7 w-7 fill-primary text-primary hover:scale-110 transition-transform",
                          )}
                        />
                      </button>
                    </TableCell>

                    {/* Image */}
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-sm bg-muted relative">
                        {song.coverArtPath ? (
                          <img
                            src={`http://localhost:3000/${song.coverArtPath.replace(/\\/g, "/")}`}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                            <Music className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        {isCurrentSong && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      className={cn(
                        "font-medium truncate max-w-[200px]",
                        isCurrentSong && "text-primary",
                      )}
                    >
                      {song.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {song.artist}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {song.album}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {item.addedAt
                        ? new Date(item.addedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    {/* Like Button */}
                    <TableCell>
                      <button
                        onClick={() => handleLike(song._id)}
                        className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      >
                        <Heart
                          className={cn(
                            "h-5 w-5",
                            likedSongs.includes(song._id) &&
                              "fill-primary text-primary",
                          )}
                        />
                      </button>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground font-mono text-xs">
                      {formatTime(song.duration)}
                    </TableCell>

                    {/* Remove Button */}
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleRemoveSong(song._id)}
                        variant="ghost"
                        size="icon"
                        className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <p>Esta playlist está vacía.</p>
          <Button
            variant="link"
            onClick={() => setShowAddSection(true)}
            className="mt-2"
          >
            ¡Busca canciones para añadir!
          </Button>
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar detalles</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePlaylist} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-40 w-40 bg-muted rounded-md flex items-center justify-center overflow-hidden relative border border-dashed border-zinc-400">
                  {editFile ? (
                    <img
                      src={URL.createObjectURL(editFile)}
                      className="h-full w-full object-cover"
                    />
                  ) : playlist.coverImagePath ? (
                    <img
                      src={`http://localhost:3000/${playlist.coverImagePath.replace(/\\/g, "/")}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFile(e.target.files[0])}
                  className="w-full text-xs cursor-pointer"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descripción</Label>
                  <Textarea
                    id="desc"
                    placeholder="Añade una descripción opcional"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="resize-none h-24"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Playlist;
