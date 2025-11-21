const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistById,
} = require("../controllers/playlistController");

// ROUTES

// POST /api/playlists - Create a new playlist (Private)
// PRIVATE
router.post("/", protect, createPlaylist);

// GET /api/playlists
// PRIVATE
router.get("/my", protect, getUserPlaylists);

// PUT /api/playlists/:id/add
// PRIVATE
router.put("/:id/add", protect, addSongToPlaylist);

module.exports = router;
