import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { X, Trash2, Play, Music, ListMusic, Shuffle, Repeat, Repeat1 } from "lucide-react";
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
function SortableQueueItem({ id, disabled, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={disabled ? "select-none" : `cursor-grab active:cursor-grabbing select-none ${isDragging ? "shadow-lg bg-muted/40 rounded-xl" : ""}`}
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
    setCurrentIndex,
    showQueue,
    setShowQueue,
    removeFromQueue,
    clearQueue,
    playSong,
    isShuffle,
    isRepeat,
    shuffledQueue,
    setShuffledQueue,
    shuffledIndex,
    setShuffledIndex,
    setCurrentSong,
    setIsPlaying,
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

  const isSortingDisabled = isRepeat !== "none";

  // Determine the active queue and index based on Shuffle state
  const activeQueue = isShuffle ? shuffledQueue : playlistQueue;
  const activeIndex = isShuffle ? shuffledIndex : currentIndex;

  // Build the list of upcoming songs based on Repeat state
  let upcomingPlaylistSongs = [];
  if (isRepeat === "one" && currentSong) {
    // Repeat one: show the current song repeated (e.g. 3 times as a visual cue)
    upcomingPlaylistSongs = [
      { ...currentSong, _id: `${currentSong._id}-rep-1`, isRepeatOne: true },
      { ...currentSong, _id: `${currentSong._id}-rep-2`, isRepeatOne: true },
      { ...currentSong, _id: `${currentSong._id}-rep-3`, isRepeatOne: true },
    ];
  } else if (isRepeat === "all" && activeQueue.length > 0) {
    const remaining = activeQueue.slice(activeIndex + 1);
    // Show remaining songs in current loop cycle, and then append the full queue to show the loop starts again
    const loopCycle = activeQueue.map((song, idx) => ({
      ...song,
      _id: `${song._id}-loop-${idx}`,
      isLoopCycle: true,
    }));
    upcomingPlaylistSongs = [...remaining, ...loopCycle];
  } else {
    // Normal or Shuffle (no repeat)
    upcomingPlaylistSongs = activeQueue.slice(activeIndex + 1);
  }

  const handleDragEndUserQueue = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.split("-")[1], 10);
    const newIndex = parseInt(over.id.split("-")[1], 10);

    setUserQueue((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleDragEndPlaylistQueue = (event) => {
    if (isSortingDisabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.split("-")[1], 10);
    const newIndex = parseInt(over.id.split("-")[1], 10);

    if (isShuffle) {
      const remainingShuffled = shuffledQueue.slice(shuffledIndex + 1);
      const newUpcomingSongs = arrayMove(remainingShuffled, oldIndex, newIndex);
      setShuffledQueue([
        ...shuffledQueue.slice(0, shuffledIndex + 1),
        ...newUpcomingSongs,
      ]);
    } else {
      const remainingNormal = playlistQueue.slice(currentIndex + 1);
      const newUpcomingSongs = arrayMove(remainingNormal, oldIndex, newIndex);
      setPlaylistQueue([
        ...playlistQueue.slice(0, currentIndex + 1),
        ...newUpcomingSongs,
      ]);
    }
  };

  const handlePlayUpcoming = (song) => {
    // Strip suffixes if they exist
    const baseId = song._id.split("-rep-")[0].split("-loop-")[0];
    const originalSong = playlistQueue.find((s) => s._id === baseId);
    if (originalSong) {
      if (isShuffle) {
        // If shuffle is active, find the index of this song in shuffledQueue and jump to it
        const sIndex = shuffledQueue.findIndex((s) => s._id === baseId);
        if (sIndex !== -1) {
          setShuffledIndex(sIndex);
          setCurrentSong(originalSong);
          setIsPlaying(true);
          return;
        }
      } else {
        // Normal mode, find the index in playlistQueue and play it
        const pIndex = playlistQueue.findIndex((s) => s._id === baseId);
        if (pIndex !== -1) {
          setCurrentIndex(pIndex);
          setCurrentSong(originalSong);
          setIsPlaying(true);
          return;
        }
      }
      playSong(originalSong, playlistQueue);
    }
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
              <div className="flex items-center justify-between pl-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Siguientes en la lista
                </h3>
                <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold">
                  {isShuffle && (
                    <span className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in fade-in zoom-in duration-200">
                      <Shuffle size={10} />
                      Aleatorio
                    </span>
                  )}
                  {isRepeat === "all" && (
                    <span className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in fade-in zoom-in duration-200">
                      <Repeat size={10} />
                      Bucle
                    </span>
                  )}
                  {isRepeat === "one" && (
                    <span className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in fade-in zoom-in duration-200">
                      <Repeat1 size={10} />
                      Bucle 1
                    </span>
                  )}
                </div>
              </div>

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
                        const isFirstLoopSong = song.isLoopCycle && (index === 0 || !upcomingPlaylistSongs[index - 1].isLoopCycle);
                        
                        return (
                          <React.Fragment key={sortableId}>
                            {isFirstLoopSong && (
                              <div className="py-2.5 flex items-center gap-2 select-none animate-in fade-in slide-in-from-top-1 duration-300">
                                <span className="h-[1px] flex-1 bg-border/40" />
                                <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                                  <Repeat size={10} />
                                  Bucle de Repetición
                                </span>
                                <span className="h-[1px] flex-1 bg-border/40" />
                              </div>
                            )}
                            <SortableQueueItem id={sortableId} disabled={isSortingDisabled}>
                              <div
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors group cursor-pointer"
                                onClick={() => handlePlayUpcoming(song)}
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
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-muted-foreground truncate">
                                        {song.artist}
                                      </span>
                                      {song.isRepeatOne && (
                                        <span className="text-[8px] font-bold text-primary bg-primary/10 px-1 py-0.2 rounded border border-primary/10 shrink-0 select-none uppercase">
                                          Bucle 1
                                        </span>
                                      )}
                                      {song.isLoopCycle && (
                                        <span className="text-[8px] font-bold text-muted-foreground/60 bg-muted/40 px-1 py-0.2 rounded border border-border/30 shrink-0 select-none uppercase">
                                          En Bucle
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SortableQueueItem>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                userQueue.length === 0 && (
                  <div className="text-center py-8 bg-muted/10 border border-dashed border-border/40 rounded-2xl animate-in fade-in duration-300">
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
