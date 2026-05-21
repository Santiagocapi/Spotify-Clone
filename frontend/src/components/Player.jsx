import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
// Time Function
import { formatTime } from "@/lib/utils";

// UI Components (Shadcn UI)
import { Slider } from "@/components/ui/slider";

// Lucide React Icons
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
  ListMusic,
} from "lucide-react";

function Player() {
  // Use the context (Added audioRef, playNext, playPrevious)
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    audioRef, // We use the global audio instance from context
    showQueue,
    setShowQueue,
  } = usePlayer();

  // State to control the volume and progress
  const [volume, setVolume] = useState([50]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // UseEffect to handle Time Updates (Progress Bar)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    // Attach events
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    // Cleanup events
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef]);

  // UseEffect to handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume, audioRef]);

  // Handle seek (User drags the slider)
  const handleSeek = (value) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!currentSong) return null; // If no song is selected, we do not display the player.

  // We construct the URLs (Optional: You could move this to a helper function)
  const API_URL = import.meta.env.VITE_API_URL || "";
  const coverUrl = currentSong.coverArtPath
    ? `${API_URL}/${currentSong.coverArtPath.replace(/\\/g, "/")}`
    : null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-40 border border-border/50 bg-card/75 dark:bg-card/70 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-border/80 transition-all duration-300 rounded-2xl select-none">
      <div className="mx-auto flex h-20 items-center justify-between px-6 md:px-8">
        {/* LEFT - SONG INFO */}
        <div className="flex w-1/3 min-w-[180px] items-center gap-4">
          {/* Cover Art */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary shadow-sm ring-1 ring-border/20">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <Music2 className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {currentSong.title}
              </span>
              {isPlaying && (
                <div className="flex items-end gap-[2px] h-3.5 shrink-0 px-1">
                  <span className="soundwave-bar animate-wave-1 h-3" />
                  <span className="soundwave-bar animate-wave-2 h-4" />
                  <span className="soundwave-bar animate-wave-3 h-2" />
                  <span className="soundwave-bar animate-wave-4 h-3.5" />
                </div>
              )}
            </div>
            <span className="truncate text-xs text-muted-foreground font-medium">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* CONTROLS CENTER */}
        <div className="flex w-1/3 min-w-[300px] flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-5">
            {/* Skip Back Button */}
            <button
              onClick={playPrevious}
              className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 p-1.5 rounded-full hover:bg-muted/40"
            >
              <SkipBack className="h-4.5 w-4.5 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Forward Button */}
            <button
              onClick={playNext}
              className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90 p-1.5 rounded-full hover:bg-muted/40"
            >
              <SkipForward className="h-4.5 w-4.5 fill-current" />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex w-full items-center gap-3 text-[10px] font-semibold text-muted-foreground/80">
            <span className="w-8 text-right font-mono">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />

            <span className="w-8 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT - VOLUME */}
        <div className="flex w-1/3 items-center justify-end gap-3.5">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`transition-all hover:scale-105 active:scale-95 p-2 rounded-full hover:bg-muted/40 ${
              showQueue 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Cola de reproducción"
          >
            <ListMusic className="h-5 w-5" />
          </button>

          <div className="flex w-full max-w-[120px] items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              defaultValue={[50]}
              value={volume}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
