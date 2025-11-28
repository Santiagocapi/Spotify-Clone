import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";

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

  // State to control the volume
  const [volume, setVolume] = useState([50]);

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

  if (!currentSong) return null; // If no song is selected, we do not display the player.

  const togglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleVolumeChange = (newValue) => {
    setVolume(newValue);
  };

  // Vite's server gives us access to the uploads folder through the proxy.
  // But we need to construct the full URL.
  const songUrl = currentSong.filePath
    ? `http://localhost:3000/${currentSong.filePath.replace(/\\/g, "/")}`
    : "";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* LEFT - SONG INFO */}
        <div className="flex w-1/3 min-w-[120px] items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Music2 className="h-6 w-6" />
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
        <div className="flex w-1/3 flex-col items-center justify-center gap-2">
          {/* Botones */}
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

          {/* Barra de Progreso (Visual por ahora) */}
          <div className="flex w-full max-w-md items-center gap-2 text-xs text-muted-foreground">
            <span>0:00</span>
            <Slider
              defaultValue={[0]}
              max={100}
              step={1}
              className="w-full cursor-pointer"
            />
            <span>0:00</span>
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
              onValueChange={handleVolumeChange}
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
      <audio ref={audioRef} src={songUrl} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}

export default Player;
