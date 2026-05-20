import { useState, useEffect } from "react";

export const useRecentPlaylists = () => {
  const [recent, setRecent] = useState([]);

  const loadRecent = () => {
    const stored = JSON.parse(localStorage.getItem("recentPlaylists") || "[]");
    setRecent(stored);
  };

  useEffect(() => {
    loadRecent();

    // Listen to custom updates within the same window
    window.addEventListener("recentPlaylistsUpdated", loadRecent);
    // Listen to storage events from other tabs
    window.addEventListener("storage", loadRecent);

    return () => {
      window.removeEventListener("recentPlaylistsUpdated", loadRecent);
      window.removeEventListener("storage", loadRecent);
    };
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
    window.dispatchEvent(new Event("recentPlaylistsUpdated"));
  };

  const removeRecent = (playlistId) => {
    const stored = JSON.parse(localStorage.getItem("recentPlaylists") || "[]");
    const filtered = stored.filter((p) => p._id !== playlistId);
    localStorage.setItem("recentPlaylists", JSON.stringify(filtered));
    window.dispatchEvent(new Event("recentPlaylistsUpdated"));
  };

  return { recent, addRecent, removeRecent };
};
