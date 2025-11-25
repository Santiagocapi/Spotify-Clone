import React, { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // State for the current song
  const [currentSong, setCurrentSong] = useState(null);

  // Is it playing?
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to play a new song
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Function to pause the song
  const pauseSong = () => {
    setIsPlaying(false);
  };

  // Function to resume the song
  const resumeSong = () => {
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        setIsPlaying, // We display this so that the Player can update it (ex: when the song ends).
        playSong,
        pauseSong,
        resumeSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use the player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw Error("usePlayer debe usarse dentro de un PlayerProvider");
  }
  return context;
};
