const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistById,
  removeSongFromPlaylist,
  deletePlaylist,
} = require("../controllers/playlistController");

// ROUTES

// POST /api/playlists - Create a new playlist
// PRIVATE
router.post("/", protect, createPlaylist);

// GET /api/playlists - Get all of a user's playlists
// PRIVATE
router.get("/my", protect, getUserPlaylists);

// PUT /api/playlists/:id/add - Add a song to a playlist
// PRIVATE
router.put("/:id/add", protect, addSongToPlaylist);

// GET /api/playlist/:id - Get a playlist by ID
// PRIVATE
router.get("/:id", protect, getPlaylistById);

// PUT /api/playlists/:id/remove - Remove a song from a playlist
// PRIVATE
router.put("/:id/remove", protect, removeSongFromPlaylist);

// DELETE /api/playlists/:id - Delete a playlist
// PRIVATE
router.delete("/:id", protect, deletePlaylist);

module.exports = router;
