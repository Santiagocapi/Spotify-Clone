const User = require("../models/userModel");
const bcrypt = require("bcryptjs"); // Library for encrypting passwords
const generateToken = require("../utils/generateToken"); // Import the token generation utility

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Extract user details from request body
    const { username, email, password } = req.body;

    // Check if all fields were completed
    if (!username || !email || !password) {
      res
        .status(400)
        .json({ message: "Por favor, complete todos los campos." });
      return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "El usuario ya existe." });
      return;
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

    // Create a new user in database
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // Store the hashed password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
        // Token generation can be added here for authentication
      });
    } else {
      res.status(400).json({ message: "Datos de usuario inválidos." });
    }
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc    Authenticate (log in) a user
// @route   POST /api/users/login
// @access  Public

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // Find user by email

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
        token: generateToken(user._id), // Generate a token for the user
      });
    } else {
      res.status(401).json({ message: "Email o constraseña invalidos." });
    }
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
};

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  // req.user is set in the authMiddleware
  if (req.user) {
    res.status(200).json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar || "",
    });
  } else {
    res.status(404).json({ message: "Usuario no encontrado." });
  }
};

// @desc    Toggles like on a song
// @route   PUT /api/users/like/:id
// @access  Private
const toggleLikeSong = async (req, res) => {
  try {
    const { id: songId } = req.params;
    const user = await User.findById(req.user._id);

    // Verify if the song is already liked
    const isLiked = user.likedSongs.includes(songId);

    if (isLiked) {
      // If already liked, remove it
      user.likedSongs = user.likedSongs.filter(
        (id) => id.toString() !== songId
      );
    } else {
      // If not liked, add it
      user.likedSongs.push(songId);
    }

    await user.save();
    res.status(200).json(user.likedSongs); // Return the updated list of liked songs
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// @desc    Obtains liked songs
// @route   GET /api/users/liked
// @access  Private
const getLikedSongs = async (req, res) => {
  try {
    // Find the user and populate the likedSongs field
    const user = await User.findById(req.user._id).populate("likedSongs");

    // Return an array if likedSongs is empty or no exists
    res.status(200).json(user.likedSongs || []);
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.username) {
        const usernameExists = await User.findOne({ username: req.body.username });
        if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
          res.status(400).json({ message: "El nombre de usuario ya está en uso." });
          return;
        }
        user.username = req.body.username;
      }
      
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }

      if (req.body.password) {
        if (!req.body.currentPassword) {
          res.status(400).json({ message: "Se requiere la contraseña actual para establecer una nueva." });
          return;
        }
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
          res.status(400).json({ message: "La contraseña actual es incorrecta." });
          return;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar || "",
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "Usuario no encontrado." });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar perfil: ${error.message}` });
  }
};

// Export the controller functions
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleLikeSong,
  getLikedSongs,
};
