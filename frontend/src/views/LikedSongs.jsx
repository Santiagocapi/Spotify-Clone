import React, { useEffect, useState } from "react";
import api from "@/lib/api";

// Context
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

// Utils
import { cn, formatTime } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons Lucid React
import { Heart, Clock3, Music, PlayCircle, PauseCircle, Play, Pause, MoreVertical, Check, Circle, X } from "lucide-react";

function LikedSongs() {
  const { user } = useAuthContext();
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const API_URL = import.meta.env.VITE_API_URL || "";

  const [songs, setSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAddToOther, setSongToAddToOther] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load liked songs and user playlists
  useEffect(() => {
    const fetchLikedAndPlaylists = async () => {
      try {
        const res = await api.get("/api/users/liked");
        setSongs(res.data); // The endpoint returns the array of songs directly

        const playlistsRes = await api.get("/api/playlists/my");
        setUserPlaylists(playlistsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLikedAndPlaylists();
  }, [user]);

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  const handleContextMenu = (e, song) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;

    const menuWidth = 180;
    const menuHeight = 120;
    const clickX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const clickY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    setContextMenu({
      x: clickX,
      y: clickY,
      song,
    });
  };

  // Function to Add/Remove from Another Playlist
  const handleToggleSong = async (playlistId, songId, isAlreadyAdded) => {
    const originalPlaylists = JSON.parse(JSON.stringify(userPlaylists));

    // Optimistic update for other playlists list
    setUserPlaylists(prev => prev.map(p => {
        if (p._id === playlistId) {
            if (isAlreadyAdded) {
                return { ...p, songs: p.songs.filter(s => (s.song?._id || s._id) !== songId) };
            } else {
                return { ...p, songs: [...p.songs, { song: songToAddToOther }] };
            }
        }
        return p;
    }));

    try {
      if (isAlreadyAdded) {
        await api.put(`/api/playlists/${playlistId}/remove`, { songId });
        toast.success("Canción eliminada de la playlist");
      } else {
        await api.put(`/api/playlists/${playlistId}/add`, { songId });
        toast.success("Canción añadida exitosamente");
      }
    } catch (err) {
      console.error(err);
      setUserPlaylists(originalPlaylists);
      toast.error(err.response?.data?.message || "Error al actualizar la playlist");
    }
  };

  // Function to remove like (remove from this list)
  const handleRemoveLike = async (songId) => {
    try {
      await api.put(`/api/users/like/${songId}`, {});
      // Update the list visually removing the song
      setSongs(songs.filter((s) => s._id !== songId));
      toast.success("Eliminada de tus Me Gusta");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Cargando tus favoritos...</div>;

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-gradient-to-br from-primary via-primary/80 to-primary/60 border border-primary/20 p-8 rounded-2xl relative overflow-hidden shadow-md text-primary-foreground dark:text-foreground animate-gradient-flow">
        {/* Ambient glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/25 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-accent/20 dark:bg-accent/10 rounded-full blur-2xl pointer-events-none animate-float" style={{ animationDelay: "3s" }} />
        
        {/* Floating Hearts background pattern overlay */}
        <div className="absolute right-12 top-6 opacity-10 dark:opacity-10 pointer-events-none animate-float select-none">
          <Heart className="h-14 w-14 fill-current text-primary-foreground dark:text-foreground" />
        </div>
        <div className="absolute right-1/3 bottom-4 opacity-[0.08] dark:opacity-[0.08] pointer-events-none animate-float select-none" style={{ animationDelay: "2s" }}>
          <Heart className="h-8 w-8 fill-current text-primary-foreground dark:text-foreground" />
        </div>
        <div className="absolute left-1/3 top-8 opacity-[0.05] dark:opacity-[0.06] pointer-events-none animate-float select-none" style={{ animationDelay: "4s" }}>
          <Heart className="h-10 w-10 fill-current text-primary-foreground dark:text-foreground" />
        </div>
        <div className="absolute left-2/3 bottom-12 opacity-10 dark:opacity-10 pointer-events-none animate-float select-none" style={{ animationDelay: "6s" }}>
          <Heart className="h-12 w-12 fill-current text-primary-foreground dark:text-foreground" />
        </div>

        <div className="flex h-52 w-52 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 dark:from-primary/30 dark:to-primary/10 backdrop-blur-md shadow-2xl border border-white/20 dark:border-primary/20">
          <Heart className="h-24 w-24 text-primary-foreground fill-primary-foreground dark:text-primary dark:fill-primary animate-pulse" />
        </div>
        <div className="flex-1 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary-foreground/60 dark:text-muted-foreground">
            Playlist
          </h5>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            Tus Me Gusta
          </h1>
          <p className="text-primary-foreground/80 dark:text-muted-foreground/90 pt-4 text-sm font-medium">
            Las canciones que te mueven, todas en un solo lugar.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <span className="text-primary-foreground dark:text-foreground">{user.username || (user.email ? user.email.split("@")[0] : "Usuario")}</span>
            <span className="text-primary-foreground/50 dark:text-muted-foreground/50">•</span>
            <span className="text-primary-foreground/90 dark:text-muted-foreground/90">{songs.length} canciones</span>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      {songs.length > 0 && (
        <div className="flex items-center px-4">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-md border-none animate-in fade-in zoom-in duration-300"
            onClick={() => playSong(songs[0], songs)}
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </Button>
        </div>
      )}

      {/* SONG TABLE */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Artista</TableHead>
              <TableHead>Álbum</TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                <Clock3 className="h-4 w-4 ml-auto" />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song, index) => {
              if (!song) return null;
              const isCurrentSong = currentSong?._id === song._id;

              return (
                <TableRow key={song._id} onContextMenu={(e) => handleContextMenu(e, song)} className="group h-16 cursor-pointer">
                  {/* Número / Play Button */}
                  <TableCell className="text-center relative font-medium text-muted-foreground w-[50px] min-w-[50px]">
                    <span
                      className={cn(
                        "group-hover:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        isCurrentSong && "text-primary"
                      )}
                    >
                      {isCurrentSong && isPlaying ? (
                        <div className="flex items-end gap-[1.5px] h-3 w-3 mx-auto">
                          <span className="soundwave-bar animate-wave-1 h-2" />
                          <span className="soundwave-bar animate-wave-2 h-3" />
                          <span className="soundwave-bar animate-wave-3 h-1.5" />
                        </div>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <button
                      onClick={() => playSong(song, songs)}
                      className="hidden group-hover:flex absolute inset-0 items-center justify-center"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-transform">
                        {isCurrentSong && isPlaying ? (
                          <Pause className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        )}
                      </div>
                    </button>
                  </TableCell>

                  {/* Foto */}
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted relative">
                      {song.coverArtPath ? (
                        <img
                          src={`${API_URL}/${song.coverArtPath.replace(
                            /\\/g,
                            "/"
                          )}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music className="p-2 h-full w-full text-muted-foreground" />
                      )}
                      {isCurrentSong && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Datos de la canción */}
                  <TableCell
                    className={cn(
                      "font-medium truncate max-w-[200px]",
                      isCurrentSong && "text-primary"
                    )}
                  >
                    {song.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate">
                    {song.artist}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate">
                    {song.album}
                  </TableCell>

                  {/* Botón de Like */}
                  <TableCell>
                    <button
                      onClick={() => handleRemoveLike(song._id)}
                      className="hover:scale-110 transition-transform"
                      title="Quitar de Me Gusta"
                    >
                      <Heart className="h-5 w-5 fill-primary text-primary" />
                    </button>
                  </TableCell>

                  {/* Duración */}
                  <TableCell className="hidden sm:table-cell text-right text-muted-foreground font-mono text-xs">
                    {formatTime(song.duration)}
                  </TableCell>

                  {/* Action Menu (Three Dots) */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                           <MoreVertical className="h-4 w-4" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => addToQueue(song)}>
                           Añadir a la cola
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => {
                             setSongToAddToOther(song);
                             setIsAddToPlaylistOpen(true);
                         }}>
                           Añadir a otra playlist
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleRemoveLike(song._id)} className="text-destructive">
                           Quitar de tus Me Gusta
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {songs.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p>Aún no tienes canciones favoritas.</p>
          </div>
        )}
      </div>

      {/* ADD TO OTHER PLAYLIST MODAL */}
      <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir a otra playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {userPlaylists.map((p) => {
              const isAlreadyAdded = p.songs.some(
                (s) => (s.song?._id || s._id) === songToAddToOther?._id
              );
              return (
                <Button
                  key={p._id}
                  variant="ghost"
                  className="justify-start gap-3 h-14 w-full"
                  onClick={() => handleToggleSong(p._id, songToAddToOther?._id, isAlreadyAdded)}
                >
                  <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                    {p.coverImagePath ? (
                      <img
                        src={`${API_URL}/${p.coverImagePath.replace(/\\/g, "/")}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground m-auto" />
                    )}
                  </div>
                  <div className="flex-1 text-left flex justify-between items-center">
                    {p.name}
                    {isAlreadyAdded ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-1.5 text-card-foreground shadow-xl animate-in fade-in-50 zoom-in-95 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              addToQueue(contextMenu.song);
              setContextMenu(null);
            }}
            className="flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 outline-none transition-colors"
          >
            Añadir a la cola
          </button>
          <button
            onClick={() => {
              setSongToAddToOther(contextMenu.song);
              setIsAddToPlaylistOpen(true);
              setContextMenu(null);
            }}
            className="flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 outline-none transition-colors"
          >
            Añadir a otra playlist
          </button>
          <Separator className="my-1 bg-border/50" />
          <button
            onClick={() => {
              handleRemoveLike(contextMenu.song._id);
              setContextMenu(null);
            }}
            className="flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 outline-none transition-colors"
          >
            Quitar de tus Me Gusta
          </button>
        </div>
      )}
    </div>
  );
}

export default LikedSongs;
