import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { X, Trash2, Play, Music, ListMusic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Helper component for sortable queue items
function SortableQueueItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing select-none ${isDragging ? "shadow-lg bg-muted/40 rounded-xl" : ""}`}
    >
      {children}
    </div>
  );
}

export default function QueueSidebar() {
  const {
    currentSong,
    userQueue,
    setUserQueue,
    playlistQueue,
    setPlaylistQueue,
    currentIndex,
    showQueue,
    setShowQueue,
    removeFromQueue,
    clearQueue,
    playSong,
  } = usePlayer();

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Pointer sensor with 8px threshold to prevent intercepting clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!showQueue) return null;

  const upcomingPlaylistSongs = playlistQueue.slice(currentIndex + 1);

  const handleDragEndUserQueue = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.split("-")[1], 10);
    const newIndex = parseInt(over.id.split("-")[1], 10);

    setUserQueue((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleDragEndPlaylistQueue = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.split("-")[1], 10);
    const newIndex = parseInt(over.id.split("-")[1], 10);

    const newUpcomingSongs = arrayMove(upcomingPlaylistSongs, oldIndex, newIndex);

    setPlaylistQueue([
      ...playlistQueue.slice(0, currentIndex + 1),
      ...newUpcomingSongs,
    ]);
  };

  return (
    <aside className="w-[260px] border-l border-border bg-card/60 backdrop-blur-xl h-full flex flex-col animate-in slide-in-from-right duration-300 relative z-30">
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
          <div className="space-y-6">
            {/* User Queue (Explicitly added) */}
            {userQueue.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 pl-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                    En cola
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearQueue}
                    className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10 hover:text-destructive px-2 rounded-lg"
                  >
                    <Trash2 size={11} className="mr-1" />
                    Borrar
                  </Button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndUserQueue}
                >
                  <SortableContext
                    items={userQueue.map((_, index) => `user-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {userQueue.map((song, index) => {
                        const coverUrl = song.coverArtPath
                          ? `${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`
                          : null;
                        const sortableId = `user-${index}`;
                        return (
                          <SortableQueueItem key={sortableId} id={sortableId}>
                            <div
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors group cursor-pointer"
                              onClick={() => {
                                removeFromQueue(song._id);
                                playSong(song);
                              }}
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
                          </SortableQueueItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Playlist Queue (Remaining) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Siguientes en la lista
              </h3>

              {upcomingPlaylistSongs.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndPlaylistQueue}
                >
                  <SortableContext
                    items={upcomingPlaylistSongs.map((_, index) => `playlist-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {upcomingPlaylistSongs.map((song, index) => {
                        const coverUrl = song.coverArtPath
                          ? `${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`
                          : null;
                        const sortableId = `playlist-${index}`;
                        return (
                          <SortableQueueItem key={sortableId} id={sortableId}>
                            <div
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors group cursor-pointer"
                              onClick={() => playSong(song, playlistQueue)}
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
                            </div>
                          </SortableQueueItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                userQueue.length === 0 && (
                  <div className="text-center py-8 bg-muted/10 border border-dashed border-border/40 rounded-2xl">
                    <Music size={24} className="mx-auto text-muted-foreground/45 mb-2" />
                    <p className="text-xs text-muted-foreground italic">No hay canciones siguientes.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
