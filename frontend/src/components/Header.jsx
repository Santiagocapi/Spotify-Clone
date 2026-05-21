import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, LogOut, Sun, Moon, X, Music } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePlayer } from "../context/PlayerContext";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [allSongs, setAllSongs] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { playSong } = usePlayer();

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Handle clicks outside the search container to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch songs and user playlists when focused
  useEffect(() => {
    if (isFocused && user) {
      const loadSearchData = async () => {
        try {
          const [songsRes, playlistsRes] = await Promise.all([
            api.get("/api/songs"),
            api.get("/api/playlists/my")
          ]);
          setAllSongs(songsRes.data || []);
          setMyPlaylists(playlistsRes.data || []);
        } catch (err) {
          console.error("Error loading search data:", err);
        }
      };
      loadSearchData();
    }
  }, [isFocused, user]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recent_searches")) || [];
    setRecentSearches(saved);
  }, [isFocused]);

  const addToRecent = (item) => {
    let updated = [item, ...recentSearches.filter((x) => x._id !== item._id)];
    if (updated.length > 5) {
      updated = updated.slice(0, 5);
    }
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const removeFromRecent = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter((x) => x._id !== id);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };

  // Filters based on query
  const filteredSongs = allSongs
    .filter((song) =>
      song.title?.toLowerCase().includes(query.toLowerCase()) ||
      song.artist?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const filteredPlaylists = myPlaylists
    .filter((pl) => pl.name?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 sticky top-0 z-40 transition-colors duration-300">
      {/* Search Form Container */}
      <div ref={searchContainerRef} className="relative w-full max-w-sm group">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Buscar canciones, artistas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="pl-10 pr-10 rounded-full bg-background/50 border-border hover:bg-background/80 focus-visible:ring-primary focus-visible:bg-background transition-all duration-300 w-full"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Real-time Search Dropdown */}
        {isFocused && (
          <div className="absolute top-full left-0 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-foreground overflow-hidden">
            {query.trim() === "" ? (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Búsquedas recientes
                </h4>
                {recentSearches.length > 0 ? (
                  <div className="space-y-1">
                    {recentSearches.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          if (item.type === "song") {
                            playSong(item, [item]);
                            addToRecent(item);
                          } else {
                            navigate(`/playlist/${item._id}`);
                            addToRecent(item);
                          }
                          setIsFocused(false);
                        }}
                        className="flex items-center justify-between rounded-xl p-2 hover:bg-muted/60 transition-colors cursor-pointer group/item"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted relative border border-border/20">
                            {item.coverArtPath || item.coverImagePath ? (
                              <img
                                src={`${API_URL}/${(item.coverArtPath || item.coverImagePath).replace(/\\/g, "/")}`}
                                alt={item.title || item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
                                <Music size={16} />
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="truncate font-semibold text-sm">
                              {item.title || item.name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {item.type === "song" ? `Canción • ${item.artist}` : "Playlist"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => removeFromRecent(e, item._id)}
                          className="text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                          title="Eliminar de recientes"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2 py-4">
                    No tienes búsquedas recientes.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Songs results */}
                {filteredSongs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                      Canciones
                    </h4>
                    <div className="space-y-1">
                      {filteredSongs.map((song) => (
                        <div
                          key={song._id}
                          onClick={() => {
                            const item = {
                              type: "song",
                              _id: song._id,
                              title: song.title,
                              artist: song.artist,
                              coverArtPath: song.coverArtPath,
                              filePath: song.filePath || song.audioPath
                            };
                            playSong(song, [song]);
                            addToRecent(item);
                            setIsFocused(false);
                            setQuery("");
                          }}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted relative border border-border/20">
                            {song.coverArtPath ? (
                              <img
                                src={`${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`}
                                alt={song.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
                                <Music size={14} />
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="truncate font-semibold text-sm text-foreground">
                              {song.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {song.artist}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlists results */}
                {filteredPlaylists.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                      Playlists
                    </h4>
                    <div className="space-y-1">
                      {filteredPlaylists.map((pl) => (
                        <div
                          key={pl._id}
                          onClick={() => {
                            const item = {
                              type: "playlist",
                              _id: pl._id,
                              name: pl.name,
                              coverImagePath: pl.coverImagePath || pl.coverArtPath
                            };
                            navigate(`/playlist/${pl._id}`);
                            addToRecent(item);
                            setIsFocused(false);
                            setQuery("");
                          }}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted relative border border-border/20">
                            {pl.coverImagePath || pl.coverArtPath ? (
                              <img
                                src={`${API_URL}/${(pl.coverImagePath || pl.coverArtPath).replace(/\\/g, "/")}`}
                                alt={pl.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
                                <Music size={14} />
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="truncate font-semibold text-sm text-foreground">
                              {pl.name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              Playlist
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {filteredSongs.length === 0 && filteredPlaylists.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-2 py-4">
                    No se encontraron resultados para "{query}".
                  </p>
                )}

                {/* View all results button */}
                <div className="border-t border-border/40 pt-2 px-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="link"
                    className="font-bold text-xs p-0 h-auto"
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setIsFocused(false);
                      setQuery("");
                    }}
                  >
                    Ver todos los resultados
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
          title={theme === "light" ? "Modo oscuro" : "Modo claro"}
        >
          {theme === "light" ? (
            <Moon size={18} className="transition-transform rotate-0 scale-100 dark:-rotate-90 dark:scale-0 duration-300" />
          ) : (
            <Sun size={18} className="transition-transform rotate-90 scale-0 dark:rotate-0 dark:scale-100 duration-300 text-yellow-500" />
          )}
        </Button>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-muted/30 hover:bg-muted/60 pl-2 pr-3 py-1 rounded-full border border-border/40 transition-colors cursor-pointer">
              <Avatar className="h-7 w-7 ring-2 ring-primary/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold tracking-wide text-foreground truncate max-w-[120px] hidden sm:inline-block">
                {user.email.split("@")[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 active:scale-95 rounded-full transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
