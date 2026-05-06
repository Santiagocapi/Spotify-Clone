import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
// Logo
import OurMusicLogo from "@/components/Logo";

// Icons Lucid React
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Disc,
  Heart,
} from "lucide-react";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
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
        const res = await api.get("/api/playlists/my", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylists(res.data);
      } catch (error) {
        console.error("Error cargando playlists en sidebar", error);
        toast.error("Error al cargar tus playlists");
      }
    };

    fetchPlaylists();
  }, [user, loading]);

  // Navigation list
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
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

          {/* PLAYLISTS WILL BE MOVED TO A NEW SECTION LATER */}
          <div className="mt-4">
             {/* New "Recents" section will go here */}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}

export default Sidebar;
