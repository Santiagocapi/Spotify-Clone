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

// Icons Lucid React
import { Heart, Clock3, Music, PlayCircle, PauseCircle, Play, Pause } from "lucide-react";

function LikedSongs() {
  const { user } = useAuthContext();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const API_URL = import.meta.env.VITE_API_URL || "";

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load liked songs
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const res = await api.get("/api/users/liked");
        setSongs(res.data); // The endpoint returns the array of songs directly
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLiked();
  }, [user]);

  // Function to remove like (remove from this list)
  const handleRemoveLike = async (songId) => {
    try {
      await api.put(`/api/users/like/${songId}`, {});
      // Update the list visually removing the song
      setSongs(songs.filter((s) => s._id !== songId));
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
            <span className="text-primary-foreground dark:text-foreground">{user.email ? user.email.split("@")[0] : "Usuario"}</span>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song, index) => {
              if (!song) return null;
              const isCurrentSong = currentSong?._id === song._id;

              return (
                <TableRow key={song._id} className="group h-16">
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
    </div>
  );
}

export default LikedSongs;
