const User = require("../models/userModel");
const bcrypt = require("bcryptjs"); // Library for encrypting passwords

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        // Extract user details from request body
        const { username, email, password } = req.body;

        // Check if all fields were completed
        if (!username || !email || !password) {
            res.status(400).json({ message: "Por favor, complete todos los campos." });
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
                // Token generation can be added here for authentication
            });
        }else{
            res.status(400).json({ message: "Datos de usuario inválidos." });
        }
            } catch (error) {
          res.status(500).json({ message: `Error del servidor: ${error.message}`});     
        }
};

// Export the controller functions
module.exports = {
    registerUser,
};