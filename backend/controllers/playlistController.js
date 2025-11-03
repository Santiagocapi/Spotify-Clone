const Playlist = require('../models/playlistModel');
const { create } = require('../models/songModel');

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private

// Handler function to create a new playlist
const createPlaylist = async (req, res) => {
    try {
        // Extract playlist name from request body
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: 'El nombre de la playlist es obligatorio' });
            return;
        }

        // Create a new playlist document in the database
        const playlist = await Playlist.create({
            name: name,
            owner: req.user._id, // Assuming req.user is set by authentication middleware
            songs: [],
        });

        // Respond with the created playlist
        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
}

module.exports = {
    createPlaylist,
}