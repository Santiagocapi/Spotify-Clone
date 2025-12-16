import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { cn, formatTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, Clock3, Music, PlayCircle, ArrowLeft } from "lucide-react";

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
      {/* SPECIAL HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end bg-gradient-to-br from-purple-700/50 to-blue-900/50 p-8 rounded-xl text-white">
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Artista</TableHead>
              <TableHead className="hidden md:table-cell">Álbum</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                <Clock3 className="h-4 w-4 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?._id === song._id;
              return (
                <TableRow key={song._id} className="group h-16">
                  <TableCell className="text-center relative font-medium text-muted-foreground">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => playSong(song)}
                      className="hidden group-hover:flex absolute inset-0 items-center justify-center text-primary"
                    >
                      <PlayCircle className="h-5 w-5 fill-current" />
                    </button>
                  </TableCell>

                  {/* Cover */}
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
                    </div>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-medium",
                      isCurrentSong && "text-primary"
                    )}
                  >
                    {song.title}
                  </TableCell>

                  {/* Like button (always filled here because it's the likes list) */}
                  <TableCell>
                    <button
                      onClick={() => handleRemoveLike(song._id)}
                      className="text-primary hover:scale-110 transition-transform"
                    >
                      <Heart className="h-5 w-5 fill-primary" />
                    </button>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {song.artist}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {song.album}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-muted-foreground font-mono">
                    {formatTime(song.duration)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default LikedSongs;
