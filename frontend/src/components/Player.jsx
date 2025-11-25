import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import styles from "./Player.module.css";

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
  const [volume, setVolume] = useState(0.5);

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
      audioRef.current.volume = volume;
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

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  // Vite's server gives us access to the uploads folder through the proxy.
  // But we need to construct the full URL.
  const songUrl = currentSong.filePath
    ? `http://localhost:3000/${currentSong.filePath.replace(/\\/g, "/")}`
    : "";

  return (
    <div className={styles.playerContainer}>
      {/* SONG INFO */}
      <div className={styles.songInfo}>
        <div
          style={{
            width: "50px",
            height: "50px",
            background: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
        >
          🎵
        </div>
        <div className={styles.songDetails}>
          <div className={styles.songTitle}>{currentSong.title}</div>
          <div className={styles.songArtist}>{currentSong.artist}</div>
        </div>
      </div>

      {/* CONTROLS (play/pause button) */}
      <div className={styles.controls}>
        <div className={styles.buttons}>
          <button className={styles.playButton} onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className={styles.progressBarContainer}>
          <span>0:00</span>
          <input type="range" className={styles.progressBar} defaultValue="0" />
          <span>0:00</span>
        </div>
      </div>

      {/* AUDIO ELEMENT */}
      {/* ref={audioRef} -> Connect this element to our 'audioRef' variable
        src={songUrl} -> The URL of the MP3 file
        onEnded -> When it finishes, we pause it    
      */}
      <audio ref={audioRef} src={songUrl} onEnded={() => setIsPlaying(false)} />

      {/* VOLUME CONTROLLER */}
      <div className={styles.volume} style={{ marginRight: "40px" }}>
        <span style={{ marginRight: "10px" }}>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: "80px", cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

export default Player;
