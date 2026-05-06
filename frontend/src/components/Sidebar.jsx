import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
// Logo
import OurMusicLogo from "@/components/Logo";

// Icons Lucid React
import {
  Home,
  Search,
  Library,
  PlusCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ListMusic,
  Disc,
  Heart,
} from "lucide-react";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const { user, loading, dispatch } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    if (!user || loading) {
      setPlaylists([]);
      return;
    }

    const fetchPlaylists = async () => {
      try {
        const res = await axios.get("/api/playlists/my", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylists(res.data);
      } catch (error) {
        console.error("Error cargando playlists en sidebar", error);
      }
    };

    fetchPlaylists();
  }, [user, loading]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  // Navigation list
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Search, label: "Explorar", path: "/explore" },
    { icon: ListMusic, label: "Playlists", path: "/playlists" },
  ];

  const libraryItems = [
    { icon: PlusCircle, label: "Crear Playlist", path: "/create-playlist" },
    { icon: Upload, label: "Subir Canción", path: "/upload" },
  ];

  // Auxiliary component to render buttons with Tooltip
  const NavButton = ({
    icon: Icon,
    image,
    label,
    path,
    onClick,
    variant = "ghost",
    className,
  }) => {
    const isActive = location.pathname === path;

    const content = (
      <Button
        variant={variant}
        onClick={onClick}
        className={cn(
          "w-full justify-start gap-4 mb-1",
          isCollapsed ? "justify-center px-2" : "px-4",
          isActive && "bg-accent text-accent-foreground",
          className,
        )}
      >
        {/* If it has an image, we show it, otherwise we show the icon */}
        {image ? (
          <img
            src={image}
            alt={label}
            className="h-5 w-5 rounded-sm object-cover shrink-0"
          />
        ) : (
          <Icon size={20} className="shrink-0" />
        )}

        {!isCollapsed && <span className="truncate">{label}</span>}
      </Button>
    );

    // If it's collapsed, we wrap it in Tooltip
    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link to={path} className="w-full block">
        {content}
      </Link>
    );
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex flex-col h-full border-r border-border bg-card transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[280px]",
        )}
      >
        {/* LOGO AND BUTTON TOGGLE */}
        <div
          className={cn(
            "flex items-center p-6",
            isCollapsed ? "justify-center px-2" : "justify-between",
          )}
        >
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <OurMusicLogo />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-primary transition-opacity duration-300">
                OurMusic
              </span>
            )}
          </Link>

          {/* Button to collapse (Only visible if not collapsed, or floating) */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 ml-auto text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </Button>
          )}
        </div>

        {/*Button to expand (If it's collapsed, we'll center it at the top) */}
        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {navItems.map((item) => (
              <NavButton key={item.label} {...item} />
            ))}
          </div>

          <Separator className="my-4 opacity-50" />

          {/* PLAYLISTS */}
          <div className="mt-4">
            {!isCollapsed && (
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Tus Playlists
              </h3>
            )}

            <div className="space-y-1">
              {/* liked songs button */}
              <NavButton
                icon={Heart}
                label="Tus Me Gusta"
                path="/collection/tracks"
                className="text-primary hover:text-primary hover:bg-primary/10"
              />
              {/* playlist list */}
              {playlists.map((playlist) => (
                <NavButton
                  key={playlist._id}
                  icon={Disc}
                  image={
                    playlist.coverImagePath
                      ? `http://localhost:3000/${playlist.coverImagePath.replace(
                          /\\/g,
                          "/",
                        )}`
                      : null
                  }
                  label={playlist.name}
                  path={`/playlist/${playlist._id}`}
                />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER ( User + Logout Button) */}
        <div className="p-3 mt-auto border-t border-border bg-background/50">
          {/* User */}
          <div
            className={cn(
              "flex items-center gap-3 mb-2",
              isCollapsed ? "justify-center" : "px-2",
            )}
          >
            <Avatar className="h-9 w-9 border border-border cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              />
              <AvatarFallback>
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {user?.email}
                </span>
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON*/}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="w-full h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default Sidebar;
