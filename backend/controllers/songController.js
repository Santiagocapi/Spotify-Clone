const Song = require("../models/songModel");
const path = require("path"); // Node.js module for handling file paths

// @desc    Upload a new song
// @route   POST /api/songs/upload
// @access  Private
const uploadSong = async (req, res) => {
  // multer middleware handles the file upload and attaches file info to req.file
  const { title, artist, album } = req.body;

  if (!title || !artist || !req.file) {
    res.status(400).json({ message: "Faltan campos obligatorios." });
    return;
  }

  const filePath = path.join("uploads", req.file.filename); // Save the file path

  try {
    const newSong = await Song.create({
      title,
      artist,
      album,
      filePath: filePath, // Path to the uploaded file
      duration: 0, // Duration can be set later using a library to read audio metadata
      uploadedBy: req.user._id, // req.user is set in the authMiddleware
    });
    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find({}); // Search for all songs in database
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

module.exports = {
    uploadSong,
    getAllSongs,
}