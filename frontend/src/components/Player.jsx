import React, { useEffect, useRef, useState } from "react";
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
  // Use the context
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    playSong,
    pauseSong,
    resumeSong,
  } = usePlayer();

  // Create the ref for the audio element
  const audioRef = useRef(null);

  // State to control the volume and progress
  const [volume, setVolume] = useState([50]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // UseEffect to handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    // If there is a song selected..
    if (currentSong) {
      if (isPlaying) {
        // And the state is Playing, play the song
        // Use play() what is a promise
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) =>
            console.error("Error al reproducir", error)
          );
        }
      } else {
        // And if the state is not playing, pause the song
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]); // It runs every time the song changes or the play/pause button is pressed.

  // UseEffect to handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      // El slider devuelve un array [valor], tomamos el primero
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!currentSong) return null; // If no song is selected, we do not display the player.

  const songUrl = currentSong.filePath
    ? `http://localhost:3000/${currentSong.filePath.replace(/\\/g, "/")}`
    : "";

  const coverUrl = currentSong.coverArtPath
    ? `http://localhost:3000/${currentSong.coverArtPath.replace(/\\/g, "/")}`
    : null;

  const togglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              disabled
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 focus:outline-none"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              disabled
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>

            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full cursor-pointer"
            />

            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* VOLUME */}
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

      {/* AUDIO ELEMENT */}
      {/* ref={audioRef} -> Connect this element to our 'audioRef' variable
        src={songUrl} -> The URL of the MP3 file
        onEnded -> When it finishes, we pause it    
      */}
      <audio
        ref={audioRef}
        src={songUrl}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate} // Se ejecuta cada segundo mientras reproduce
        onLoadedMetadata={handleLoadedMetadata} // Se ejecuta al cargar la canción para saber la duración
      />
    </div>
  );
}

export default Player;
