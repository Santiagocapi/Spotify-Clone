const mongoose = require("mongoose");

// Define the Song schema
const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio."],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, "El artista es obligatorio."],
      trim: true,
    },
    album: {
      type: String,
      trim: true,
      default: "Single", // If no album is provided, default to 'Single'
    },
    duration: {
      type: Number,
      required: true,
    },
    filePath: {
      // mp3 file location
      type: String,
      required: true,
    },
    coverArtPath: {
      // (Optional) root to cover art image
      type: String,
    },
    // Reference to the User who uploaded the song
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "User", // Makes a reference to the User model
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Song', songSchema);