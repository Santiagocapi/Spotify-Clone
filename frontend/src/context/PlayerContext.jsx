import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  // State for the current song
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the queue
  const [queue, setQueue] = useState([]);
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
  }, [currentIndex, queue]); // Dependencies to ensure playNext has fresh values

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
      setQueue(newQueue);
      const index = newQueue.findIndex((s) => s._id === song._id);
      setCurrentIndex(index);
    } else if (queue.length === 0) {
      // If no queue and it's a standalone song, the queue is just that song
      setQueue([song]);
      setCurrentIndex(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Function to play the next song
  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
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
      setCurrentSong(queue[prevIndex]);
      setIsPlaying(true);
    }
  };

  const removeFromQueue = (songId) => {
    const songIndex = queue.findIndex((s) => s._id === songId);
    if (songIndex === -1) return;

    const newQueue = queue.filter((_, idx) => idx !== songIndex);
    setQueue(newQueue);

    if (songIndex < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (songIndex === currentIndex) {
      if (newQueue.length === 0) {
        setCurrentSong(null);
        setCurrentIndex(-1);
        setIsPlaying(false);
      } else if (currentIndex < newQueue.length) {
        setCurrentSong(newQueue[currentIndex]);
      } else {
        setCurrentIndex(newQueue.length - 1);
        setCurrentSong(newQueue[newQueue.length - 1]);
      }
    }
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(-1);
    }
  };

  const value = {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    queue,
    audioRef,
    showQueue,
    setShowQueue,
    removeFromQueue,
    clearQueue,
    currentIndex,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
