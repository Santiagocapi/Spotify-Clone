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
    <div className="z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* LEFT - SONG INFO */}
        <div className="flex w-1/3 min-w-[180px] items-center gap-4">
          {/* Cover Art */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary shadow-sm">
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
            <span className="truncate text-sm font-semibold text-foreground">
              {currentSong.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* CONTROLS CENTER */}
        <div className="flex w-1/3 min-w-[300px] flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-6">
            {/* Skip Back Button */}
            <button
              onClick={playPrevious}
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-1" />
              )}
            </button>

            {/* Skip Forward Button */}
            <button
              onClick={playNext}
              className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
            <span className="w-10 text-right font-mono">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full cursor-pointer"
            />

            <span className="w-10 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT - VOLUME */}
        <div className="flex w-1/3 justify-end">
          <div className="flex w-full max-w-[120px] items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider
              defaultValue={[50]}
              value={volume}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val)}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
