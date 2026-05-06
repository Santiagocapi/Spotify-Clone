import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { cn, formatTime } from "@/lib/utils";

// Import Contexts
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

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
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Icons
import { PlusCircle, Music, Disc, Plus } from "lucide-react";

function Home() {
  // State for data
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  const { user, loading: authLoading } = useAuthContext();
  const { playSong } = usePlayer();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Songs
        const songRes = await axios.get("/api/songs");
        // Ensure it's an array
        setSongs(Array.isArray(songRes.data) ? songRes.data : []);

        // 2. Fetch Playlists (Only if user is logged in)
        if (user) {
          const playlistsRes = await axios.get("/api/playlists/my", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setPlaylists(
            Array.isArray(playlistsRes.data) ? playlistsRes.data : [],
          );
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("No se pudieron cargar las canciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  // Open the "Add to Playlist" modal
  const openAddModal = (song) => {
    setSongToAdd(song);
    setIsModalOpen(true);
  };

  // Handle adding song to a playlist
  const handleAddToPlaylist = async (playlistId, playlistName) => {
    if (!songToAdd) return;

    try {
      await axios.put(
        `/api/playlists/${playlistId}/add`,
        { songId: songToAdd._id },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      toast.success(`"${songToAdd.title}" added to ${playlistName}`);
      setIsModalOpen(false);
      setSongToAdd(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add song.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-muted-foreground">
        Loading library...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-destructive font-medium">
        {error}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 pb-20 p-6">
        {/* --- PLAYLISTS SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Your Playlists
            </h2>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/create-playlist">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Create new playlist</TooltipContent>
            </Tooltip>
          </div>

          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {playlists.map((playlist) => (
                <Link key={playlist._id} to={`/playlist/${playlist._id}`}>
                  <Card className="group relative h-full overflow-hidden border-none bg-muted/40 transition-all hover:bg-muted cursor-pointer">
                    <CardContent className="p-4">
                      {/* Cover Image */}
                      <div className="mb-4 aspect-square w-full overflow-hidden rounded-md bg-zinc-100 shadow-sm relative">
                        {playlist.coverImagePath ? (
                          <img
                            src={`http://localhost:3000/${playlist.coverImagePath.replace(/\\/g, "/")}`}
                            alt={playlist.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                            <Disc className="h-10 w-10 opacity-50" />
                          </div>
                        )}
                      </div>

                      <h3 className="truncate font-semibold text-foreground">
                        {playlist.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <p>You don't have any playlists yet.</p>
            </div>
          )}
        </section>

        {/* --- SONGS SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Available Songs
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/upload">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Upload new song</TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {songs.map((song) => {
              // Safety check: Skip invalid songs
              if (!song || !song._id) return null;

              return (
                <div key={song._id} className="group relative">
                  <Card
                    className="cursor-pointer border-none bg-transparent shadow-none transition-transform hover:scale-105"
                    onClick={() => playSong(song, songs)}
                  >
                    <CardContent className="p-0">
                      {/* Cover Art */}
                      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-muted">
                        {song.coverArtPath ? (
                          <img
                            src={`http://localhost:3000/${song.coverArtPath.replace(/\\/g, "/")}`}
                            alt={song.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50 bg-secondary/50">
                            <Music className="h-12 w-12" />
                          </div>
                        )}

                        {/* Hover Button: Add to Playlist */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-black/70 text-white hover:bg-primary hover:text-primary-foreground border-none backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent playing song
                                  openAddModal(song);
                                }}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add to playlist</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h3 className="truncate font-semibold text-foreground text-sm">
                          {song.title}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span className="truncate max-w-[70%]">
                            {song.artist}
                          </span>
                          <span>{formatTime(song.duration)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- ADD TO PLAYLIST MODAL --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Playlist</DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[300px] w-full rounded-md border p-2">
              {playlists.length > 0 ? (
                <div className="space-y-1">
                  {playlists.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleAddToPlaylist(p._id, p.name)}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                          {p.coverImagePath ? (
                            <img
                              src={`http://localhost:3000/${p.coverImagePath.replace(/\\/g, "/")}`}
                              className="h-full w-full object-cover rounded"
                            />
                          ) : (
                            <Disc className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.songs?.length || 0} songs
                          </span>
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground p-4">
                  <p>You don't have any playlists yet.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link
                      to="/create-playlist"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Create one first
                    </Link>
                  </Button>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default Home;
