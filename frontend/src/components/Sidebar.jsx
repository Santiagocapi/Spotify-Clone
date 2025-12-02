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
  Heart,
  Settings,
  ListMusic,
  Disc,
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
  const { user, dispatch } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (user) {
          const res = await axios.get("/api/playlists/my", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setPlaylists(res.data);
        }
      } catch (error) {
        console.error("Error cargando playlists en sidebar", error);
      }
    };

    fetchPlaylists();

    // In a real app, i would use a PlaylistContext to update playlists automatically,
    // now it refreshes when navigating
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  // Navigation list
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Search, label: "Explorar", path: "/explore" },
    { icon: Heart, label: "Favoritos", path: "/favorites" },
    { icon: ListMusic, label: "Recientes", path: "/history" },
  ];

  const libraryItems = [
    { icon: PlusCircle, label: "Crear Playlist", path: "/create-playlist" },
    { icon: Upload, label: "Subir Canción", path: "/upload" },
  ];

  // Auxiliary component to render buttons with Tooltip
  const NavButton = ({
    icon: Icon,
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
          className
        )}
      >
        <Icon size={20} />
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
          "relative flex flex-col h-screen border-r border-border bg-card transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {/* LOGO AND BUTTON TOGGLE */}
        <div
          className={cn(
            "flex items-center p-6",
            isCollapsed ? "justify-center px-2" : "justify-between"
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

        {/* SCROLLABLE CONTENT (Navigation) */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {navItems.map((item) => (
              <NavButton key={item.label} {...item} />
            ))}
          </div>

          <Separator className="my-4 opacity-50" />

          <div className="space-y-1 py-2">
            {!isCollapsed && (
              <div className="flex items-center gap-2 mb-2">
                <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  <Library className="h-4 w-4 inline-block" /> Tu Biblioteca
                </h3>
              </div>
            )}
            {libraryItems.map((item) => (
              <NavButton key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-4">
            {!isCollapsed && playlists.length > 0 && (
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Playlists
              </h3>
            )}

            <div className="space-y-1">
              {playlists.map((playlist) => (
                <NavButton
                  key={playlist._id}
                  icon={Disc} // O puedes usar una imagen pequeña si la tienes
                  label={playlist.name}
                  path={`/playlist/${playlist._id}`}
                />
              ))}
              {playlists.length === 0 && !isCollapsed && (
                <p className="px-4 text-sm text-muted-foreground">
                  Sin playlists
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Playlists */}

        {/* FOOTER ( User + Logout Button) */}
        <div className="p-3 mt-auto border-t border-border bg-background/50">
          {/* User */}
          <div
            className={cn(
              "flex items-center gap-3 mb-2",
              isCollapsed ? "justify-center" : "px-2"
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
