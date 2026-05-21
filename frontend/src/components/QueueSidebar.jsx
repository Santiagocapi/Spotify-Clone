import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { X, Trash2, Play, Music, ListMusic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function QueueSidebar() {
  const {
    currentSong,
    queue,
    currentIndex,
    showQueue,
    setShowQueue,
    removeFromQueue,
    clearQueue,
    playSong,
  } = usePlayer();

  const API_URL = import.meta.env.VITE_API_URL || "";

  if (!showQueue) return null;

  // Next songs in the queue are from currentIndex + 1
  const upcomingSongs = queue.slice(currentIndex + 1);

  return (
    <aside className="w-80 border-l border-border bg-card/60 backdrop-blur-xl h-full flex flex-col animate-in slide-in-from-right duration-300 relative z-30">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/80 shrink-0">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <ListMusic size={18} className="text-primary" />
          <span>Cola de reproducción</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowQueue(false)}
          className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Now Playing */}
          {currentSong && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sonando ahora
              </h3>
              <div className="bg-muted/30 border border-border/40 p-3.5 rounded-2xl space-y-3">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary relative border border-border/10 shadow-md">
                  {currentSong.coverArtPath ? (
                    <img
                      src={`${API_URL}/${currentSong.coverArtPath.replace(/\\/g, "/")}`}
                      alt={currentSong.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                      <Music size={32} />
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {currentSong.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Tracks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Siguientes en la cola
              </h3>
              {upcomingSongs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearQueue}
                  className="h-7 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive px-2 rounded-lg"
                >
                  <Trash2 size={12} className="mr-1" />
                  Borrar cola
                </Button>
              )}
            </div>

            {upcomingSongs.length > 0 ? (
              <div className="space-y-1">
                {upcomingSongs.map((song, index) => {
                  const coverUrl = song.coverArtPath
                    ? `${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`
                    : null;
                  return (
                    <div
                      key={`${song._id}-${index}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors group cursor-pointer"
                      onClick={() => playSong(song, queue)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary relative border border-border/20 shadow-sm flex items-center justify-center">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={song.title}
                              className="h-full w-full object-cover group-hover:opacity-40 transition-opacity"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                              <Music size={16} />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={14} className="text-foreground fill-current" />
                          </div>
                        </div>
                        <div className="truncate">
                          <h5 className="font-semibold text-xs text-foreground truncate">
                            {song.title}
                          </h5>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromQueue(song._id);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100"
                        title="Eliminar de la cola"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/10 border border-dashed border-border/40 rounded-2xl">
                <Music size={24} className="mx-auto text-muted-foreground/45 mb-2" />
                <p className="text-xs text-muted-foreground italic">No hay canciones siguientes.</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
