import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { toast } from "sonner";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  // State for the current song
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the queue
  const [userQueue, setUserQueue] = useState([]);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showQueue, setShowQueue] = useState(false);

  const audioRef = useRef(new Audio());

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Effect to handle play/pause and song state
  useEffect(() => {
    if (currentSong) {
      const songPath = currentSong.filePath || currentSong.audioPath;
      // If the source changed, update it
      const songUrl = `${API_URL}/${songPath.replace(/\\/g, "/")}`;
      if (audioRef.current.src !== songUrl) {
        audioRef.current.src = songUrl;
        audioRef.current.load();
        if (isPlaying)
          audioRef.current.play().catch((e) => console.error("Error play:", e));
      } else {
        // If it's the same song, just toggle play/pause
        if (isPlaying)
          audioRef.current.play().catch((e) => console.error("Error play:", e));
        else audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  // Effect to handle song ended
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      playNext();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentIndex, userQueue, playlistQueue]); // Dependencies to ensure playNext has fresh values

  // Recived a song and a new queue
  const playSong = (song, newQueue = []) => {
    if (currentSong?._id === song._id) {
      togglePlay();
      return;
    }

    setCurrentSong(song);
    setIsPlaying(true);

    // If we receive a new queue (e.g: click on playlist), we use it as the queue
    if (newQueue.length > 0) {
      setPlaylistQueue(newQueue);
      const index = newQueue.findIndex((s) => s._id === song._id);
      setCurrentIndex(index);
    } else {
      const index = playlistQueue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        setCurrentIndex(index);
      } else {
        setPlaylistQueue([song]);
        setCurrentIndex(0);
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Function to play the next song
  const playNext = () => {
    if (userQueue.length > 0) {
      const nextSong = userQueue[0];
      setUserQueue(userQueue.slice(1));
      setCurrentSong(nextSong);
      setIsPlaying(true);
    } else if (currentIndex < playlistQueue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(playlistQueue[nextIndex]);
      setIsPlaying(true);
    } else {
      // End of the playlist: pause or we could go back to the start
      setIsPlaying(false);
    }
  };

  // Function to play the previous song
  const playPrevious = () => {
    if (audioRef.current.currentTime > 3) {
      // If more than 3 seconds have passed, restart the current song
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      // If we're at the beginning, go to the previous song
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(playlistQueue[prevIndex]);
      setIsPlaying(true);
    }
  };

  const removeFromQueue = (songId) => {
    setUserQueue((prevQueue) => prevQueue.filter((s) => s._id !== songId));
    toast.success("Canción eliminada de la cola");
  };

  const clearQueue = () => {
    setUserQueue([]);
    toast.success("Cola de reproducción vaciada");
  };

  const addToQueue = (song) => {
    setUserQueue((prevQueue) => [...prevQueue, song]);
    toast.success(`"${song.title}" añadida a la cola.`);
  };

  const value = {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    userQueue,
    setUserQueue,
    playlistQueue,
    setPlaylistQueue,
    audioRef,
    showQueue,
    setShowQueue,
    removeFromQueue,
    clearQueue,
    currentIndex,
    addToQueue,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
