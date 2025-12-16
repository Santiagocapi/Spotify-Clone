import React, { useEffect, useState } from "react";
import axios from "axios";

// Context
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

// Utils
import { cn, formatTime } from "@/lib/utils";

// UI Components (Shadcn UI)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons Lucid React
import { Heart, Clock3, Music, PlayCircle } from "lucide-react";

function LikedSongs() {
  const { user } = useAuthContext();
  const { playSong, currentSong, isPlaying } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load liked songs
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const res = await axios.get("/api/users/liked", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
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
      await axios.put(
        `/api/users/like/${songId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      // Update the list visually removing the song
      setSongs(songs.filter((s) => s._id !== songId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Cargando tus favoritos...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-gradient-to-br from-purple-100/80 to-blue-600/50 p-8 rounded-xl text-white">
        <div className="flex h-52 w-52 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
          <Heart className="h-24 w-24 text-white fill-white" />
        </div>
        <div className="flex-1 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider">
            Playlist
          </h5>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            Tus Me Gusta
          </h1>
          <p className="text-white/70 pt-4 text-sm font-medium">
            Las canciones que te mueven, todas en un solo lugar.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <span>{user.username}</span>
            <span>•</span>
            <span>{songs.length} canciones</span>
          </div>
        </div>
      </div>

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
                  <TableCell className="text-center relative font-medium text-muted-foreground">
                    <span
                      className={cn(
                        "group-hover:hidden",
                        isCurrentSong && "text-primary"
                      )}
                    >
                      {index + 1}
                    </span>
                    <button
                      onClick={() => playSong(song)}
                      className="hidden group-hover:flex absolute inset-0 items-center justify-center text-primary"
                    >
                      <PlayCircle
                        className={cn(
                          "h-6 w-6 hover:scale-110 transition-transform",
                          isCurrentSong && "fill-primary text-primary"
                        )}
                      />
                    </button>
                  </TableCell>

                  {/* Foto */}
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted relative">
                      {song.coverArtPath ? (
                        <img
                          src={`http://localhost:3000/${song.coverArtPath.replace(
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
            <p className="text-sm mt-1">¡Explora y dales amor! ❤️</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedSongs;
