import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, LogOut, Sun, Moon, X, Music, User } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePlayer } from "../context/PlayerContext";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AVATAR_PRESETS = [
  { id: "preset-1", seed: "Santiago", name: "Santiago" },
  { id: "preset-2", seed: "Cami", name: "Cami" },
  { id: "preset-3", seed: "Leo", name: "Leo" },
  { id: "preset-4", seed: "Sofia", name: "Sofia" },
  { id: "preset-5", seed: "Maria", name: "Maria" },
  { id: "preset-6", seed: "Alex", name: "Alex" },
];

export const renderAvatarContent = (userObj, sizeClass = "h-7 w-7") => {
  const avatar = userObj?.avatar || "";
  const email = userObj?.email || "";
  const username = userObj?.username || email;
  const fallbackText = username.substring(0, 2).toUpperCase();
  const textClass = sizeClass.includes("h-16") ? "text-lg" : "text-[10px]";

  const isGradient = avatar.startsWith("gradient-");
  if (isGradient) {
    // Backwards compatibility for old gradient avatars
    const gradientClasses = {
      "gradient-1": "from-amber-200 via-yellow-400 to-orange-500 text-amber-950",
      "gradient-2": "from-teal-300 via-emerald-400 to-green-600 text-teal-950",
      "gradient-3": "from-gray-700 via-slate-800 to-black text-white",
      "gradient-4": "from-blue-400 via-indigo-500 to-purple-600 text-blue-950",
      "gradient-5": "from-rose-300 via-pink-400 to-red-500 text-rose-950",
      "gradient-6": "from-purple-400 via-violet-500 to-indigo-700 text-purple-950",
    };
    const bgClasses = gradientClasses[avatar] || "from-amber-200 via-yellow-400 to-orange-500 text-amber-950";
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold uppercase shadow-inner bg-gradient-to-br ${bgClasses} ${textClass}`}>
        {fallbackText}
      </div>
    );
  }

  const seed = avatar || email;
  return (
    <Avatar className={`${sizeClass} ring-2 ring-primary/10`}>
      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`} />
      <AvatarFallback className={`bg-primary/10 text-primary font-semibold ${textClass}`}>{fallbackText}</AvatarFallback>
    </Avatar>
  );
};

export function Header() {
  const { user, dispatch } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { playSong } = usePlayer();
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [allSongs, setAllSongs] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // States for user profile configuration
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [dicebearSeed, setDicebearSeed] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user && isProfileOpen) {
      setProfileUsername(user.username || user.email.split("@")[0]);
      const avatar = user.avatar || "";
      const isPreset = AVATAR_PRESETS.some(p => p.seed === avatar);
      if (isPreset) {
        setSelectedAvatar(avatar);
        setDicebearSeed("");
      } else if (avatar.startsWith("gradient-")) {
        setSelectedAvatar(avatar);
        setDicebearSeed("");
      } else {
        setSelectedAvatar("");
        setDicebearSeed(avatar);
      }
      setErrorMsg("");
      setProfilePassword("");
      setCurrentPassword("");
    }
  }, [user, isProfileOpen]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileUsername.trim()) {
      setErrorMsg("El nombre de usuario es requerido.");
      return;
    }
    setIsSaving(true);
    setErrorMsg("");

    try {
      const avatarValue = selectedAvatar || dicebearSeed;
      const payload = {
        username: profileUsername,
        avatar: avatarValue,
      };
      if (profilePassword.trim()) {
        if (!currentPassword.trim()) {
          setErrorMsg("Debe ingresar su contraseña actual para establecer una nueva.");
          setIsSaving(false);
          return;
        }
        payload.password = profilePassword;
        payload.currentPassword = currentPassword;
      }

      const res = await api.put("/api/users/profile", payload);
      
      const updatedUser = {
        ...user,
        username: res.data.username,
        avatar: res.data.avatar,
        token: res.data.token || user.token,
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: "LOGIN", payload: updatedUser });

      toast.success("Perfil actualizado con éxito.");
      setIsProfileOpen(false);
      setProfilePassword("");
      setCurrentPassword("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error al actualizar el perfil.");
      toast.error(err.response?.data?.message || "Error al actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreviewAvatar = () => {
    const previewUser = {
      username: profileUsername,
      email: user?.email,
      avatar: selectedAvatar || dicebearSeed
    };
    return renderAvatarContent(previewUser, "h-16 w-16");
  };
  


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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 bg-muted/30 hover:bg-muted/60 pl-2 pr-3 py-1 rounded-full border border-border/40 transition-colors cursor-pointer select-none active:scale-95">
                  {renderAvatarContent(user, "h-7 w-7")}
                  <span className="text-xs font-semibold tracking-wide text-foreground truncate max-w-[120px] hidden sm:inline-block">
                    {user.username || user.email.split("@")[0]}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-normal">
                  <div className="font-semibold text-foreground truncate">{user.username || user.email.split("@")[0]}</div>
                  <div className="text-[10px] truncate">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-muted focus:bg-muted transition-colors text-foreground"
                >
                  <User size={14} className="text-muted-foreground" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive font-medium transition-colors"
                >
                  <LogOut size={14} />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog para Editar Perfil */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogContent className="sm:max-w-[425px] bg-card/95 border border-border text-foreground backdrop-blur-xl rounded-2xl shadow-2xl p-6 z-50">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-wide text-foreground">Editar Perfil</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Actualiza tu nombre de usuario, contraseña o personaliza tu avatar.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
                  {errorMsg && (
                    <div className="text-xs font-semibold text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-2xl border border-border/40">
                    <div className="shrink-0">{renderPreviewAvatar()}</div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista previa</span>
                      <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{profileUsername || "Usuario"}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nombre de usuario
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nombre de usuario"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      className="bg-background/50 border-border focus-visible:ring-primary focus-visible:bg-background rounded-xl transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nueva Contraseña <span className="text-[10px] text-muted-foreground font-normal">(Opcional)</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Dejar en blanco para no cambiar"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="bg-background/50 border-border focus-visible:ring-primary focus-visible:bg-background rounded-xl transition-all"
                    />
                  </div>

                  {profilePassword.trim() && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label htmlFor="currentPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Contraseña Actual <span className="text-[10px] text-destructive font-normal">(Requerido)</span>
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-background/50 border-border focus-visible:ring-primary focus-visible:bg-background rounded-xl transition-all"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Selecciona tu Avatar
                    </Label>
                    
                    {/* Presets Grid */}
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((preset) => {
                        const isSelected = selectedAvatar === preset.seed;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(preset.seed);
                              setDicebearSeed("");
                            }}
                            className={`h-11 w-11 rounded-full overflow-hidden relative transition-all duration-200 hover:scale-105 active:scale-95 shadow-md border ${
                              isSelected 
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 border-primary" 
                                : "opacity-75 hover:opacity-100 border-border/40"
                            }`}
                            title={preset.name}
                          >
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(preset.seed)}`} 
                              alt={preset.name} 
                              className="h-full w-full object-cover bg-muted/40"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* DiceBear Seed Input */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        O escribe un texto para generar un avatar en DiceBear
                      </span>
                      <Input
                        type="text"
                        placeholder="Ej: metal, rock, santi..."
                        value={dicebearSeed}
                        onChange={(e) => {
                          setDicebearSeed(e.target.value);
                          setSelectedAvatar("");
                        }}
                        className="bg-background/50 border-border focus-visible:ring-primary focus-visible:bg-background rounded-xl transition-all h-8 text-xs"
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsProfileOpen(false)}
                      className="rounded-xl hover:bg-muted text-foreground transition-all flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex-1 sm:flex-none"
                    >
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </header>
  );
}
