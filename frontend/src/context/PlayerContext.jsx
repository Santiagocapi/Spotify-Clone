import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuthContext } from "./AuthContext";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

// Fisher-Yates Shuffle algorithm
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const PlayerProvider = ({ children }) => {
  const { user } = useAuthContext();

  // State for the current song
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the queue
  const [userQueue, setUserQueue] = useState([]);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showQueue, setShowQueue] = useState(false);

  // New Player States
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState("none"); // "none" | "all" | "one"
  const [likedSongs, setLikedSongs] = useState([]);
  const [shuffledQueue, setShuffledQueue] = useState([]);
  const [shuffledIndex, setShuffledIndex] = useState(-1);

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
      playNext(true); // Pass true for automatic advancement
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentIndex, shuffledIndex, isShuffle, isRepeat, userQueue, playlistQueue, shuffledQueue, currentSong]);

  // Fetch Liked Songs when user logs in or out
  const fetchLikedSongs = async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/users/liked");
      setLikedSongs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching liked songs:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLikedSongs();
    } else {
      setLikedSongs([]);
    }
  }, [user]);

  // Toggle Like status of a song
  const toggleLike = async (song) => {
    if (!song) return;
    const songId = song._id;
    try {
      await api.put(`/api/users/like/${songId}`, {});
      let isLikedNow = false;
      setLikedSongs((prev) => {
        const exists = prev.some((s) => s._id === songId);
        if (exists) {
          isLikedNow = false;
          return prev.filter((s) => s._id !== songId);
        } else {
          isLikedNow = true;
          return [...prev, song];
        }
      });
      toast.success(isLikedNow ? "Añadida a tus Me Gusta" : "Eliminada de tus Me Gusta");
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Error al actualizar favoritos");
    }
  };

  // Received a song and a new queue
  const playSong = (song, newQueue = []) => {
    if (currentSong?._id === song._id) {
      togglePlay();
      return;
    }

    setCurrentSong(song);
    setIsPlaying(true);

    let activeQueue = playlistQueue;

    // If we receive a new queue (e.g: click on playlist), we use it as the queue
    if (newQueue.length > 0) {
      setPlaylistQueue(newQueue);
      activeQueue = newQueue;
      const index = newQueue.findIndex((s) => s._id === song._id);
      setCurrentIndex(index);
    } else {
      const index = playlistQueue.findIndex((s) => s._id === song._id);
      if (index !== -1) {
        setCurrentIndex(index);
      } else {
        setPlaylistQueue([song]);
        activeQueue = [song];
        setCurrentIndex(0);
      }
    }

    // If shuffle is active, generate and set a shuffled queue starting with this song
    if (isShuffle) {
      const remainingSongs = activeQueue.filter((s) => s._id !== song._id);
      const shuffled = [song, ...shuffleArray(remainingSongs)];
      setShuffledQueue(shuffled);
      setShuffledIndex(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Toggle Shuffle
  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (nextShuffle) {
      if (currentSong) {
        const remainingSongs = playlistQueue.filter((s) => s._id !== currentSong._id);
        const shuffled = [currentSong, ...shuffleArray(remainingSongs)];
        setShuffledQueue(shuffled);
        setShuffledIndex(0);
      } else {
        const shuffled = shuffleArray(playlistQueue);
        setShuffledQueue(shuffled);
        setShuffledIndex(0);
      }
    } else {
      if (currentSong) {
        const idx = playlistQueue.findIndex((s) => s._id === currentSong._id);
        if (idx !== -1) {
          setCurrentIndex(idx);
        }
      }
    }
  };

  // Toggle Repeat
  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      if (prev === "none") return "all";
      if (prev === "all") return "one";
      return "none";
    });
  };

  // Function to play the next song
  const playNext = (isAutomatic = false) => {
    if (isAutomatic && isRepeat === "one" && currentSong) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.error("Error replay:", e));
      return;
    }

    // 1. Check user queue
    if (userQueue.length > 0) {
      const nextSong = userQueue[0];
      setUserQueue(userQueue.slice(1));
      setCurrentSong(nextSong);
      setIsPlaying(true);
      return;
    }

    // 2. Play from playlistQueue or shuffledQueue
    if (isShuffle) {
      if (shuffledIndex < shuffledQueue.length - 1) {
        const nextIndex = shuffledIndex + 1;
        setShuffledIndex(nextIndex);
        setCurrentSong(shuffledQueue[nextIndex]);
        setIsPlaying(true);
      } else {
        // End of shuffled queue
        if (isRepeat === "all" && shuffledQueue.length > 0) {
          setShuffledIndex(0);
          setCurrentSong(shuffledQueue[0]);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    } else {
      if (currentIndex < playlistQueue.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setCurrentSong(playlistQueue[nextIndex]);
        setIsPlaying(true);
      } else {
        // End of playlist
        if (isRepeat === "all" && playlistQueue.length > 0) {
          setCurrentIndex(0);
          setCurrentSong(playlistQueue[0]);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    }
  };

  // Function to play the previous song
  const playPrevious = () => {
    if (audioRef.current.currentTime > 3) {
      // If more than 3 seconds have passed, restart the current song
      audioRef.current.currentTime = 0;
    } else if (isShuffle) {
      if (shuffledIndex > 0) {
        const prevIndex = shuffledIndex - 1;
        setShuffledIndex(prevIndex);
        setCurrentSong(shuffledQueue[prevIndex]);
        setIsPlaying(true);
      }
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
    setCurrentIndex,
    setCurrentSong,
    setIsPlaying,
    addToQueue,
    // Shuffle & Repeat states and toggles
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    shuffledQueue,
    setShuffledQueue,
    shuffledIndex,
    setShuffledIndex,
    // Liked songs sync
    likedSongs,
    setLikedSongs,
    toggleLike,
    fetchLikedSongs,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
