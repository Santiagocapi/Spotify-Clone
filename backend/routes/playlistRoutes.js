const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPlaylist, getUserPlaylists } = require('../controllers/playlistController');

// ROUTES

// POST /api/playlists - Create a new playlist (Private)
// PRIVATE
router.post('/', protect, createPlaylist);

// GET /api/playlists 
// PRIVATE
router.get('/my', protect, getUserPlaylists);

module.exports = router;