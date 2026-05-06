import { useState, useEffect } from "react";

export const useRecentPlaylists = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentPlaylists") || "[]");
    setRecent(stored);
  }, []);

  const addRecent = (playlist) => {
    const stored = JSON.parse(localStorage.getItem("recentPlaylists") || "[]");
    // Remove if already exists to move to top
    const filtered = stored.filter((p) => p._id !== playlist._id);
    const newRecent = [
      {
        _id: playlist._id,
        name: playlist.name,
        coverImagePath: playlist.coverImagePath,
      },
      ...filtered,
    ].slice(0, 5);

    localStorage.setItem("recentPlaylists", JSON.stringify(newRecent));
    setRecent(newRecent);
  };

  return { recent, addRecent };
};
