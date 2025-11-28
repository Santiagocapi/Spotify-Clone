const Song = require("../models/songModel");
const path = require("path"); // Node.js module for handling file paths
const fs = require("fs"); // Node.js module for file system operations (To write the image to disk)
const { parseFile } = require("music-metadata"); // Node.js module for parsing audio metadata

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

  const audioPath = req.file.path; // Save the file path
  const relativeAudioPath = path.join("uploads", req.file.filename); // DB path

  let duration = 0;
  let coverArtPath = null;

  try {
    // Parse the audio file to get metadata
    const metadata = await parseFile(audioPath);

    // Get the duration of the audio file (seconds)
    duration = metadata.format.duration || 0;

    // Get the cover art from the metadata
    const picture = metadata.common.picture ? metadata.common.picture[0] : null;

    if (picture) {
      // Create a unique name from the image
      const coverFilename = `${req.file.filename.split(".")[0]}.jpg`;
      const coverPhysicalPath = path.join(
        __dirname,
        "../uploads/covers",
        coverFilename
      );

      // Saves the image to disk
      fs.writeFileSync(coverPhysicalPath, picture.data);

      // Save the relative path for the DB
      coverArtPath = path.join("uploads", "covers", coverFilename);
    }

    const newSong = await Song.create({
      title,
      artist,
      album: album || metadata.common.album || "Sencillo", // If album is not provided, use the album from the metadata
      duration,
      filePath: relativeAudioPath,
      coverArtPath: coverArtPath, // If cover art is not provided, use the cover art from the metadata
      uploadedBy: req.user._id, // req.user is set in the authMiddleware
    });
    res.status(201).json(newSong);
  } catch (error) {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    console.error(error);
    res
      .status(500)
      .json({ message: `Error al procesar la canción: ${error.message}` });
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
};
