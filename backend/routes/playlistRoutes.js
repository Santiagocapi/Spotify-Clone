const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistById,
  removeSongFromPlaylist,
  deletePlaylist,
  editPlaylist,
} = require("../controllers/playlistController");

// MULTER CONFIG (for playlist images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save the uploaded image in the "uploads/playlists" directory
    cb(null, path.join(__dirname, "../uploads/covers/"));
  },
  filename: (req, file, cb) => {
    cb(null, `playlist-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ROUTES

// POST /api/playlists - Create a new playlist
// PRIVATE
router.post("/", protect, createPlaylist);

// GET /api/playlists - Get all of a user's playlists
// PRIVATE
router.get("/my", protect, getUserPlaylists);

// PUT /:id - Edit a playlist
// PRIVATE
router.put("/:id", protect, upload.single("coverImage"), editPlaylist);
// Use upload.single("image") to handle the uploaded image

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
