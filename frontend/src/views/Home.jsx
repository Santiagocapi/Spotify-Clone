import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { cn, formatTime } from "@/lib/utils";

// Import Contexts
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useRecentPlaylists } from "../hooks/useRecentPlaylists";

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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Icons
import { PlusCircle, Music, Disc, Plus, Heart, Play, Trash2 } from "lucide-react";

function Home() {
  // State for data
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]); // State for liked songs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  const { user, loading: authLoading } = useAuthContext();
  const { playSong } = usePlayer();
  const { recent } = useRecentPlaylists();

  // Sort playlists: most recently used first (from left to right)
  const sortedPlaylists = React.useMemo(() => {
    if (!playlists || playlists.length === 0) return [];
    return [...playlists].sort((a, b) => {
      const indexA = recent.findIndex((r) => r._id === a._id);
      const indexB = recent.findIndex((r) => r._id === b._id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }, [playlists, recent]);

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
        const songRes = await api.get("/api/songs");
        // Ensure it's an array
        setSongs(Array.isArray(songRes.data) ? songRes.data : []);

        // 2. Fetch Playlists (Only if user is logged in)
        if (user) {
          const playlistsRes = await api.get("/api/playlists/my");
          setPlaylists(
            Array.isArray(playlistsRes.data) ? playlistsRes.data : [],
          );

          // Fetch Liked Songs
          const likedRes = await api.get("/api/users/liked");
          setLikedSongs(Array.isArray(likedRes.data) ? likedRes.data : []);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("No se pudieron cargar las canciones.");
        toast.error(
          err.response?.data?.message || "Error al cargar la librería.",
        );
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
      await api.put(
        `/api/playlists/${playlistId}/add`,
        { songId: songToAdd._id },
      );

      toast.success(`"${songToAdd.title}" added to ${playlistName}`);
      setIsModalOpen(false);
      setSongToAdd(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add song.");
    }
  };

  // Handle deleting song permanently
  const handleDeleteSong = async (songId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta canción PERMANENTEMENTE del sistema? Se borrará del disco y de todas las playlists.")) {
      return;
    }

    try {
      await api.delete(`/api/songs/${songId}`);
      toast.success("Canción eliminada permanentemente");
      
      // Update local songs state
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      
      // Update playlists state if necessary
      setPlaylists((prev) => prev.map(p => ({
        ...p,
        songs: p.songs ? p.songs.filter(item => (item.song?._id || item._id) !== songId) : []
      })));
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error al eliminar la canción.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        {/* Playlists Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </section>
        {/* Songs Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </section>
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
      <div className="space-y-8 pb-32 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- WELCOME HERO BANNER --- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary via-accent/40 to-secondary dark:from-secondary/30 dark:via-accent/15 dark:to-secondary/30 border border-border/40 p-6 md:p-8 shadow-md animate-gradient-flow">
          {/* Ambient mesh glows with hardware-accelerated float animation */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 dark:bg-amber-500/10 blur-3xl animate-float pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-emerald-500/25 dark:bg-emerald-500/15 blur-2xl animate-float pointer-events-none" style={{ animationDelay: "3s" }} />
          
          {/* Floating graphic elements to guarantee visible motion */}
          <div className="absolute right-16 top-4 text-amber-500/15 dark:text-amber-500/10 pointer-events-none animate-float select-none">
            <Music className="h-28 w-28" />
          </div>
          <div className="absolute left-1/3 bottom-2 text-emerald-500/15 dark:text-emerald-500/10 pointer-events-none animate-float select-none" style={{ animationDelay: "4s" }}>
            <Disc className="h-16 w-16" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                ¡Hola, {user.username || (user.email ? user.email.split("@")[0] : "Melómano")}! 
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl font-medium">
                Bienvenido de nuevo a OurMusic. Explora tus playlists recientes, reproduce tus canciones favoritas o sube música nueva a la biblioteca.
              </p>
            </div>
            <div className="flex gap-3 shrink-0 relative z-20">
              <Link to="/upload">
                <Button className="rounded-full font-bold shadow-sm hover:scale-105 active:scale-95 transition-all">
                  Subir canción
                </Button>
              </Link>
              <Link to="/create-playlist">
                <Button variant="secondary" className="rounded-full font-bold border border-border hover:scale-105 active:scale-95 transition-all">
                  Nueva playlist
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- YOUR PLAYLISTS --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Tus Playlists
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/create-playlist">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 hover:bg-muted"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Crear nueva Playlist</TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LIKED SONGS FEATURED CARD */}
            {user && (
              <div className="xl:col-span-1">
                <Link to="/collection/tracks">
                  <Card className="group relative h-full overflow-hidden border border-primary/30 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground dark:text-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer p-6 flex flex-col justify-between min-h-[200px] rounded-2xl shadow-md animate-gradient-flow">
                    {/* Ambient glow inside card */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 dark:bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                      <Heart className="h-36 w-36 fill-current stroke-none" />
                    </div>
                    
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/25 dark:bg-primary/20 text-primary-foreground dark:text-primary shadow-sm">
                      <Heart className="h-6 w-6 fill-current text-primary-foreground dark:text-primary animate-pulse" />
                    </div>
                    
                    <div className="mt-12 space-y-1 relative z-10">
                      <h3 className="text-2xl font-black tracking-tight text-primary-foreground dark:text-foreground">
                        Canciones que te gustan
                      </h3>
                      <p className="text-sm text-primary-foreground/80 dark:text-muted-foreground font-medium">
                        {likedSongs.length} {likedSongs.length === 1 ? "canción guardada" : "canciones guardadas"}
                      </p>
                    </div>

                    {likedSongs.length > 0 && (
                      <div className="absolute bottom-6 right-6 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                        <Button
                          size="icon"
                          className="h-12 w-12 rounded-full bg-primary-foreground text-primary dark:bg-background dark:text-foreground hover:scale-105 active:scale-95 shadow-lg border-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            playSong(likedSongs[0], likedSongs);
                          }}
                        >
                          <Play className="h-5 w-5 fill-current ml-0.5 text-primary dark:text-foreground" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </Link>
              </div>
            )}

            {/* RECENT PLAYLISTS */}
            <div className="xl:col-span-2 flex flex-col justify-between">
              {sortedPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
                  {sortedPlaylists.map((playlist) => (
                    <Link key={playlist._id} to={`/playlist/${playlist._id}`}>
                      <Card className="group relative h-20 overflow-hidden border border-border/30 bg-muted/20 hover:bg-muted/50 dark:bg-card/30 dark:hover:bg-muted/20 transition-all duration-300 cursor-pointer rounded-xl flex items-center pr-4 shadow-sm">
                        
                        {/* Cover Image */}
                        <div className="h-full w-20 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative border-r border-border/20">
                          {playlist.coverImagePath ? (
                            <img
                              src={`${API_URL}/${playlist.coverImagePath.replace(/\\/g, "/")}`}
                              alt={playlist.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                              <Disc className="h-8 w-8 opacity-45" />
                            </div>
                          )}
                        </div>

                        {/* Title and stats */}
                        <div className="flex-1 min-w-0 px-4">
                          <h3 className="truncate font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
                            {playlist.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                            {playlist.songs?.length || 0} canciones
                          </p>
                        </div>

                        {/* Hover Play Button */}
                        <div className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0">
                          <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-md border-none"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (playlist.songs && playlist.songs.length > 0) {
                                const playlistSongs = playlist.songs.map(s => s.song || s).filter(s => s && s.title);
                                if (playlistSongs.length > 0) {
                                  playSong(playlistSongs[0], playlistSongs);
                                }
                              } else {
                                toast.error("La playlist está vacía");
                              }
                            }}
                          >
                            <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-dashed border-border/60 p-8 text-center text-muted-foreground bg-muted/10 min-h-[200px]">
                  <p className="text-sm font-medium">Aún no tienes playlists creadas.</p>
                  <Link to="/create-playlist" className="mt-2">
                    <Button variant="link" className="font-bold">Crear una ahora</Button>
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </section>

        {/* --- SONGS SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Canciones
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/upload">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-8 w-8 hover:bg-muted"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Subir nueva Cancion</TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {songs.map((song) => {
              if (!song || !song._id) return null;

              return (
                <div key={song._id} className="group">
                  <Card
                    className="cursor-pointer border border-border/30 bg-muted/20 hover:bg-muted/50 dark:bg-card/30 dark:hover:bg-muted/20 transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 flex flex-col h-full"
                    onClick={() => playSong(song, songs)}
                  >
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      {/* Cover Art */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-sm mb-3">
                        {song.coverArtPath ? (
                          <img
                            src={`${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`}
                            alt={song.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/45 bg-gradient-to-br from-secondary/50 to-accent/30">
                            <Music className="h-10 w-10" />
                          </div>
                        )}

                        {/* Hover Overlay: Glassmorphic Play Button */}
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                          <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 border-none">
                            <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Hover Button: Add to Playlist */}
                        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-primary hover:text-primary-foreground border-none backdrop-blur-md active:scale-90 transition-all shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAddModal(song);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Añadir a playlist</TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Hover Button: Delete Song (only for owner) */}
                        {(song.uploadedBy === user._id || (song.uploadedBy?._id || song.uploadedBy) === user._id) && (
                          <div className="absolute top-2.5 left-2.5 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-destructive hover:text-destructive-foreground border-none backdrop-blur-md active:scale-90 transition-all shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSong(song._id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar del sistema</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1 px-1">
                        <h3 className="truncate font-bold text-foreground text-sm tracking-tight">
                          {song.title}
                        </h3>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground font-semibold">
                          <span className="truncate max-w-[70%] group-hover:text-foreground transition-colors">
                            {song.artist}
                          </span>
                          <span>{formatTime(song.duration)}</span>
                        </div>
                      </div>
                    </div>
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
                              src={`${API_URL}/${p.coverImagePath.replace(/\\/g, "/")}`}
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
