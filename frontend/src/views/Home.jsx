import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// Time Function
import { cn, formatTime } from "@/lib/utils";

// Import the contexts
import { useAuthContext } from "../context/AuthContext"; // Get Token
import { usePlayer } from "../context/PlayerContext"; // Play songs

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lucide React Icons
import { PlusCircle, Music, Disc, Plus } from "lucide-react";

function Home() {
  // State to save the songs and playlists we bring from the backend
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  // Status to know if we are loading
  const [loading, setLoading] = useState(true);
  // State to save errors if something goes wrong
  const [error, setError] = useState(null);

  // State to show the modal and the song to add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  // We use the context to obtain the user token
  const { user } = useAuthContext();
  // Use the player context to play songs
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We make the GET request to our backend
        const songRes = await axios.get("/api/songs");
        setSongs(songRes.data);

        const playlistsRes = await axios.get("/api/playlists/my", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPlaylists(playlistsRes.data);
      } catch (err) {
        console.error("Error al cargar canciones", err);
        setError("No se pudieron cargar las canciones");
      } finally {
        setLoading(false);
      }
    };
    // We only attempt to load if there is a user (although ProtectedRoute already ensures this)
    if (user) {
      fetchData();
    }
  }, [user]); // Run when user loads

  // Function to open the modal
  const openAddModal = (song) => {
    setSongToAdd(song);
    setIsModalOpen(true);
  };

  // Call the API to add songs
  const handleAddToPlaylist = async (playlistId) => {
    try {
      await axios.put(
        `/api/playlists/${playlistId}/add`,
        { songId: songToAdd._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`¡"${songToAdd.title}" agregada a la playlist!`);
      setShowModal(false); // Close modal
      setSongToAdd(null); // Clean selection
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al agregar la canción");
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-10 text-muted-foreground">
        Cargando tu biblioteca...
      </div>
    );

  if (error)
    return (
      <div className="flex h-full items-center justify-center p-10 text-destructive">
        {error}
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      {/* PLAYLIST SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Tus Playlists
          </h2>

          {/* Button to create playlist */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/create-playlist">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  title="Crear nueva playlist"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Crear nueva playlist</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {playlists.map((playlist) => (
              <Link key={playlist._id} to={`/playlist/${playlist._id}`}>
                <Card className="group relative h-full overflow-hidden border-none bg-muted/40 transition-all hover:bg-muted">
                  <CardContent className="p-4">
                    <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
                      <Disc />
                    </div>
                    <h3 className="truncate font-semibold text-foreground">
                      {playlist.name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {playlist.songs.length} canciones
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p>Aún no tienes playlists creadas.</p>
          </div>
        )}
      </section>

      {/* SONGS SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-tertiary">
            Canciones Disponibles
          </h2>

          {/* Button to upload song */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/upload">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  title="Subir nueva canción"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-foreground text-background">
              <p>Subir nueva canción</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {songs.map((song) => (
            <div key={song._id} className="group relative">
              {/* SONG CARD */}
              <Card
                className="cursor-pointer border-none bg-transparent shadow-none transition-transform hover:scale-105"
                onClick={() => playSong(song)}
              >
                <CardContent className="p-0">
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {/* Show cover art or music icon */}
                    {song.coverArtPath ? (
                      <img
                        src={`http://localhost:3000/${song.coverArtPath.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt={song.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                        <Music className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 border-none"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que suene la canción al hacer clic aquí
                              openAddModal(song);
                            }}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-foreground text-background">
                          <p>Agregar a playlist</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* SONG INFO */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="truncate ...">{song.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(song.duration)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODAL SECTION (popup window) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar a Playlist</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {playlists.length > 0 ? (
              <div className="space-y-2">
                {playlists.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleAddToPlaylist(p._id)}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        <Disc />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.songs.length} canciones
                        </span>
                      </div>
                    </div>
                    <span className="text-xl text-muted-foreground">
                      <Plus className="h-5 w-5 transition-colors hover:text-primary" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No tienes playlists. ¡Crea una primero!
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Home;
