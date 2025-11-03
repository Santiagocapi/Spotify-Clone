const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPlaylist } = require('../controllers/playlistController');

// ROUTES

// POST /api/playlists - Create a new playlist (Private)
// PRIVATE
router.post('/', protect, createPlaylist);

module.exports = router;