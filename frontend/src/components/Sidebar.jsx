import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { useRecentPlaylists } from "../hooks/useRecentPlaylists";
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
  const { user, loading, dispatch } = useAuthContext();
  const { recent } = useRecentPlaylists();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Validate and clean up deleted playlists from local storage recents
  useEffect(() => {
    if (!user) return;

    const validateRecent = async () => {
      try {
        const res = await api.get("/api/playlists/my");
        if (Array.isArray(res.data)) {
          const activeIds = new Set(res.data.map((p) => p._id));
          const stored = JSON.parse(localStorage.getItem("recentPlaylists") || "[]");
          const filtered = stored.filter((r) => activeIds.has(r._id));
          
          if (filtered.length !== stored.length) {
            localStorage.setItem("recentPlaylists", JSON.stringify(filtered));
            window.dispatchEvent(new Event("recentPlaylistsUpdated"));
          }
        }
      } catch (err) {
        console.error("Error validating recent playlists:", err);
      }
    };

    validateRecent();
  }, [user]);

  // Navigation list
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Heart, label: "Me Gusta", path: "/collection/tracks" },
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
          "w-full justify-start gap-4 mb-1.5 transition-all duration-200 rounded-lg active:scale-[0.98]",
          isCollapsed ? "justify-center px-2" : "px-4",
          isActive 
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 font-semibold" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          className,
        )}
      >
        {/* If it has an image, we show it, otherwise we show the icon */}
        {image ? (
          <img
            src={image}
            alt={label}
            className="h-8 w-8 rounded-md object-cover shrink-0 shadow-sm"
          />
        ) : (
          <Icon size={20} className={cn("shrink-0", label === "Me Gusta" && isActive && "fill-current text-destructive-foreground")} />
        )}

        {!isCollapsed && <span className="truncate text-sm tracking-wide">{label}</span>}
      </Button>
    );

    // If it's collapsed, we wrap it in Tooltip
    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link to={path} className="w-full block">
              {content}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs">
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
          "relative flex flex-col h-full border-r border-border/80 bg-card transition-all duration-300 z-30 select-none",
          isCollapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        {/* LOGO AND BUTTON TOGGLE */}
        <div
          className={cn(
            "flex items-center h-16 px-6 border-b border-border/40",
            isCollapsed ? "justify-center px-2" : "justify-between",
          )}
        >
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden active:scale-95 transition-transform">
            <OurMusicLogo />
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight text-primary transition-opacity duration-300">
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
              className="h-8 w-8 ml-auto text-muted-foreground hover:bg-muted rounded-full active:scale-90 transition-all"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Button to expand (If it's collapsed, we'll center it at the top) */}
        {isCollapsed && (
          <div className="flex justify-center my-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full active:scale-90 transition-all"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-3">
            {navItems.map((item) => (
              <NavButton key={item.label} {...item} />
            ))}
          </div>

          <Separator className="my-2 bg-border/50" />

          <div className="mt-4">
            {!isCollapsed && (
              <h3 className="mb-3 px-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-80">
                Recientes
              </h3>
            )}
            <div className="space-y-1">
              {recent.map((playlist) => (
                <NavButton
                  key={playlist._id}
                  icon={Disc}
                  image={
                    playlist.coverImagePath
                      ? `${API_URL}/${playlist.coverImagePath.replace(/\\/g, "/")}`
                      : null
                  }
                  label={playlist.name}
                  path={`/playlist/${playlist._id}`}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}

export default Sidebar;
