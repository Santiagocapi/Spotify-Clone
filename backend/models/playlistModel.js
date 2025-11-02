const mongoose = require("mongoose");

// Define the Playlist schema
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la playlist es obligatorio."],
    trim: true,
  },
  // Who created the playlist
  owner: {
    type: mongoose.Schema.Types.ObjectId, // Id of the User
    required: true,
    ref: "User", // Reference to User model
  },
  songs: [ // [] because song are an array for IDs
    {
      type: mongoose.Schema.Types.ObjectId, // Id of the Song
      ref: "Song", // Reference to Song model
    }
  ],
  // (Optional) cover image file
  coverImagePath: {
    type: String, // Path to the cover image file
  }
},
{
    timestamps: true,
});

module.exports = mongoose.model('Playlist', playlistSchema);