const Song = require("../models/songModel");
const path = require("path"); // Node.js module for handling file paths
const fs = require("fs"); // Node.js module for file system operations (To write the image to disk)
const mm = require("music-metadata"); // music-metadata module for reading metadata from audio files

// @desc    Upload a new song
// @route   POST /api/songs/upload
// @access  Private
const uploadSong = async (req, res) => {
  // multer middleware handles the file upload and attaches file info to req.file
  const { title, artist, album } = req.body;

  if (!title || !artist || !req.file) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }
  const localAudioPath = req.file.path; // Save the file path
  const dbFilePath = path.join("uploads", req.file.filename); // DB path

  let duration = 0;
  let coverArtPath = null;

  try {
    // Parse the audio file to get metadata
    const metadata = await mm.parseFile(localAudioPath);
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

      // Create the directory if it doesn't exist
      const coverDir = path.dirname(coverPhysicalPath);
      if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

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
      filePath: dbFilePath,
      coverArtPath: coverArtPath, // If cover art is not provided, use the cover art from the metadata
      uploadedBy: req.user._id, // req.user is set in the authMiddleware
    });
    res.status(201).json(newSong);
  } catch (error) {
    if (fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
      } catch (e) {}
    }
    console.error(error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// @desc    Upload multiple songs reading metadata
// @route   POST /api/songs/bulk
// @access  Private
const createSongsBulk = async (req, res) => {
  try {
    const files = req.files; // array of files

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No se subieron archivos." });
    }

    const songsToSave = [];
    const processedInfo = [];

    for (const file of files) {
      // Parse the audio file to get metadata
      let metadata;
      try {
        metadata = await mm.parseFile(file.path);
      } catch (err) {
        console.warn(
          `No se pudieron leer metadatos de ${file.originalname}`,
          err
        );
        metadata = { common: {}, format: {} };
      }

      const { common, format } = metadata;

      // Get the title, artist, album, and duration from the metadata
      let title = common.title;
      let artist = common.artist || "Desconocido";
      const album = common.album || "Sencillo";
      const duration = format.duration || 0;

      // If no title is in the tag, use the file name "Artist - Song"
      if (!title) {
        const fileNameNoExt = file.originalname.replace(/\.[^/.]+$/, "");
        const parts = fileNameNoExt.split(" - ");
        if (parts.length >= 2) {
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        } else {
          title = fileNameNoExt;
        }
      }

      // Get the cover art from the metadata
      let coverArtPath = null;
      if (common.picture && common.picture.length > 0) {
        const picture = common.picture[0];
        const ext = picture.format === "image/jpeg" ? "jpg" : "png";
        const coverFilename = `cover-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${ext}`;
        const coverPath = path.join(
          __dirname,
          "../uploads/covers",
          coverFilename
        );

        // Create the directory if it doesn't exist
        const coverDir = path.dirname(coverPath);
        if (!fs.existsSync(coverDir))
          fs.mkdirSync(coverDir, { recursive: true });

        fs.writeFileSync(coverPath, picture.data);
        coverArtPath = path.join("uploads", "covers", coverFilename);
      }

      // Push the song to the array
      songsToSave.push({
        title,
        artist,
        album,
        duration,
        filePath: path.join("uploads", file.filename), // Multer saves directly to uploads/
        coverArtPath,
        uploadedBy: req.user._id,
      });

      processedInfo.push(`${title} - ${artist}`);
    }

    // Save the songs in the database
    if (songsToSave.length > 0) {
      await Song.insertMany(songsToSave);
    }

    res.status(201).json({
      message: `¡Éxito! ${songsToSave.length} canciones procesadas.`,
      details: processedInfo,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error en carga masiva: ${error.message}` });
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
  createSongsBulk,
};
