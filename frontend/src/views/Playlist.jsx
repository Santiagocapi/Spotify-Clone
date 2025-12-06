import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // useParams - To read the id from the URL,
// useNavigate - To redirect when delete a playlist
import axios from "axios";
// Context
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

import { cn, formatTime } from "@/lib/utils";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";

// Lucide React Icons
import {
  Trash2,
  Clock3,
  Music,
  PlayCircle,
  ArrowLeft,
  Edit2,
  Camera,
} from "lucide-react";

function Playlist() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = usePlayer(); // To play a song

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]); // Songs list and add songs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false); // To show/hide the panel to add songs

  // Edition states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Function to upload files (playlist and all the songs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We make the GET request to our backend using populate to get the songs details
        const playlistRes = await axios.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(playlistRes.data);

        // We make the GET request to our backend to get all songs
        const songsRes = await axios.get("/api/songs");
        setAllSongs(songsRes.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user]);

  // Function to edit playlist
  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", editName);
    formData.append("description", editDesc);
    if (editFile) {
      formData.append("coverImage", editFile);
    }

    try {
      const res = await axios.put(`/api/playlists/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPlaylist(res.data); // Update playlist in the screen
      setIsEditOpen(false); // Exit modal
    } catch (err) {
      alert("Error al actualizar playlist");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to Add Songs
  const handleAddSong = async (songId) => {
    try {
      // We make the GET request to our backend to add the song to the playlist
      const updatedPlaylistRes = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Update the playlist in the screen with the response from the server
      setPlaylist(updatedPlaylistRes.data);
      alert("Canción agregada con éxito");
    } catch (err) {
      alert(err.response?.data?.message || "Error al agregar canción");
    }
  };

  // Function to Delete Song
  const handleRemoveSong = async (songId) => {
    if (!window.confirm("¿Quitar esta canción de la lista?")) return;

    try {
      await axios.put(
        `/api/playlists/${id}/remove`,
        { songId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Update the playlist in the screen with the response from the server
      const res = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPlaylist(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error al quitar canción");
    }
  };

  // Funciont to Delete Playlist
  const handleDeletePlaylist = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta playlist entera?"))
      return;

    try {
      await axios.delete(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/"); // Back to home
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar playlist");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">Cargando...</div>
    );
  if (error)
    return <div className="p-10 text-center text-destructive">{error}</div>;
  if (!playlist) return <div className="p-10 text-center">No encontrada</div>;

  // Filter songs to no repeat them
  const songsToAdd = allSongs.filter(
    (song) => !playlist.songs.some((pSong) => pSong._id === song._id)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* PLAYLIST HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-gradient-to-b from-zinc-100/50 to-background p-6 rounded-xl">
        {/* Playlist cover */}
        <div
          className="group relative flex h-52 w-52 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-xl cursor-pointer bg-muted"
          onClick={() => setIsEditOpen(true)}
        >
          {playlist.coverImagePath ? (
            <img
              src={`http://localhost:3000/${playlist.coverImagePath.replace(
                /\\/g,
                "/"
              )}`}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Music className="h-20 w-20 text-muted-foreground/50" />
          )}

          {/* Overlay edit Image */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Editar foto</span>
          </div>
        </div>

        {/* PLAYLIST INFO */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Playlist
            </h5>
            {/* TITLE (Click to edit) */}
            <h1
              className="text-2xl font-black tracking-tight sm:text-6xl hover:underline cursor-pointer decoration-4 decoration-primary"
              onClick={() => setIsEditOpen(true)}
            >
              {playlist.name}
            </h1>
            <p className="text-muted-foreground pt-4">
              {playlist.description || "Sin descripción"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            {/* User Name, user avatar comming soon */}
            <span className="text-foreground">Tu Playlist</span>
            <span>•</span>
            <span>{playlist.songs.length} canciones</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

      {/* ADD SONG SECTION */}
      {showAddSection && (
        <Card className="border-dashed bg-muted/30">
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
      {/* SONG LIST (TABLE) */}
      {playlist.songs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Álbum</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  <Clock3 className="h-4 w-4 inline-block ml-auto" />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlist.songs.map((item, index) => {
                const song = item.song;
                if (!song) return null;

                const isCurrentSong = currentSong?._id === song._id;

                return (
                  <TableRow key={song._id} className="group h-16">
                    <TableCell className="font-medium text-muted-foreground text-center relative">
                      <span
                        className={cn(
                          "group-hover:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                          isCurrentSong && "text-primary"
                        )}
                      >
                        {index + 1}
                      </span>
                      <button
                        onClick={() => playSong(song)}
                        className="hidden group-hover:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-foreground"
                      >
                        <PlayCircle
                          className={cn(
                            "h-5 w-5",
                            isCurrentSong && "fill-primary text-primary"
                          )}
                        />
                      </button>
                    </TableCell>

                    {/* SONG IMG */}
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-sm bg-muted relative">
                        {song.coverArtPath ? (
                          <img
                            src={`http://localhost:3000/${song.coverArtPath.replace(
                              /\\/g,
                              "/"
                            )}`}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                            <Music className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        {/* Animation current song */}
                        {isCurrentSong && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* TITLE */}
                    <TableCell className="font-medium truncate max-w-[200px]">
                      <span className={cn(isCurrentSong && "text-primary")}>
                        {song.title}
                      </span>
                    </TableCell>
                    {/* ARTIST */}
                    <TableCell className="text-muted-foreground">
                      {song.artist}
                    </TableCell>
                    {/* ALBUM */}
                    <TableCell className="text-muted-foreground">
                      {song.album}
                    </TableCell>
                    {/* ADDED AT */}
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </TableCell>
                    {/* DURATION */}
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground font-mono text-xs">
                      {formatTime(song.duration)}
                    </TableCell>

                    {/* REMOVE SECTION */}
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleRemoveSong(song._id)}
                        variant="ghost"
                        size="icon"
                        className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        title="Quitar de la lista"
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

      {/* MODAL SECTION (EDIT) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar detalles</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdatePlaylist} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
              {/* Image Input */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-40 w-40 bg-muted rounded-md flex items-center justify-center overflow-hidden relative border border-dashed border-zinc-400">
                  {editFile ? (
                    <img
                      src={URL.createObjectURL(editFile)}
                      className="h-full w-full object-cover"
                    />
                  ) : playlist.coverImagePath ? (
                    <img
                      src={`http://localhost:3000/${playlist.coverImagePath.replace(
                        /\\/g,
                        "/"
                      )}`}
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
                  className="w-full text-xs cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              {/* Text Inputs */}
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
