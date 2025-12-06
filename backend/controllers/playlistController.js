const Playlist = require("../models/playlistModel");
const Song = require("../models/songModel");
const path = require("path");
const { create } = require("../models/songModel");

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private

// Handler function to create a new playlist
const createPlaylist = async (req, res) => {
  try {
    // Extract playlist name from request body
    const { name } = req.body;

    if (!name) {
      res
        .status(400)
        .json({ message: "El nombre de la playlist es obligatorio" });
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
};

// @desc    Get all of a user's playlists
// @route   GET /api/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    // Find playlists owned by the ID
    const playlists = await Playlist.find({ owner: req.user._id });
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc Add a song to a playlist
// // @route PUT /api/playlists/:id/add
// // @access Private
// // Handler function to add a song to a playlist
const addSongToPlaylist = async (req, res) => {
  try {
    // Extract songId from request body and playlistId from request params
    const { songId } = req.body;
    const { id: playlistId } = req.params;

    // Check if the song exists
    song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    // Check if the playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" });
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: no eres el dueño de la playlist" });
    }

    // Check if the song is already in the playlist
    const songExists = playlist.songs.find(
      (item) => item.song.toString() === songId
    );
    if (songExists) {
      return res
        .status(400)
        .json({ message: "La canción ya está en la playlist" });
    }

    // If its all ok, add the song to the playlist
    playlist.songs.push({ song: songId });

    await playlist.save();
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc Get a playlist by ID (with detailed songs)
// @route GET /api/playlist/:id
// @access Private
const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;

    // We search for the playlist and "fill" the 'songs' field with the actual data
    const playlist = await Playlist.findById(id).populate("songs.song");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc    Delete a song from a playlist
// @route   PUT /api/playlists/:id/remove
// @access  Private

const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const { id: playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" });
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: no eres el dueño de la playlist" });
    }

    // Filter the array of songs to remove the song with the given ID
    playlist.songs = playlist.songs.filter(
      (item) => item.song.toString() !== songId
    );

    await playlist.save();
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" });
    }

    // Check if the user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await playlist.deleteOne();
    res.status(200).json({ message: "Playlist eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc    Edit a playlist (name, description, image)
// @route   PUT /api/playlists/:id
// @access  Private
const editPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" });
    }

    // Check if the user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;

    await playlist.save();
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistById,
  removeSongFromPlaylist,
  deletePlaylist,
  editPlaylist,
};
