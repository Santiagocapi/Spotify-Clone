const express = require('express');
const router = express.Router(); // Create a new router instance

// Import controller functions
const { registerUser, loginUser} = require('../controllers/userController');

router.post('/register', registerUser) // Define the route for user registration (ENDPOINT)

router.post('/login', loginUser) // Define the route for user login (ENDPOINT)

// Later, we will add the login path here
// router.post('/login', loginUser) 

// Export the router to be used in the main app
module.exports = router;