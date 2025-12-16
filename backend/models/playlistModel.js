const mongoose = require("mongoose");

// Define the Playlist schema
const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la playlist es obligatorio."],
      trim: true,
    },
    description: {
      // Optional
      type: String,
      default: "",
    },
    coverArtPath: {
      // Image path
      type: String,
      default: null,
    },
    // Who created the playlist
    owner: {
      type: mongoose.Schema.Types.ObjectId, // Id of the User
      required: true,
      ref: "User", // Reference to User model
    },
    songs: [
      {
        // Ahora guardamos un objeto con el ID y la Fecha
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now, // Se guarda la fecha actual automáticamente
        },
      },
    ],
    // (Optional) cover image file
    coverImagePath: {
      type: String, // Path to the cover image file
    },
    lastPlayedAt: {
      // When the playlist was last played
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Playlist", playlistSchema);
