const express = require("express");
const router = express.Router(); // Create a new router instance

// Import the protect middleware
const { protect } = require("../middleware/authMiddleware");

// Import controller functions
const {
  registerUser,
  loginUser,
  getUserProfile,
  toggleLikeSong,
  getLikedSongs,
} = require("../controllers/userController");

router.post("/register", registerUser); // Define the route for user registration (ENDPOINT)

router.post("/login", loginUser); // Define the route for user login (ENDPOINT)

router.get("/profile", protect, getUserProfile); // Define the route for getting user profile (ENDPOINT)

router.put("/like/:id", protect, toggleLikeSong); // Toggles like on a song

router.get("/liked", protect, getLikedSongs); // Obtains liked songs

// Export the router to be used in the main app
module.exports = router;
