const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user ID from the token
            req.user = await User.findById(decoded.id).select('-password'); //.select('-password') prevents us from retrieving the hash

            if (!req.user) {
                res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
                return;
            }
            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            // Invalid or expired token
            res.status(401).json({ message: 'No autorizado, token inválido.' });
            return;
        }
    }

    // No token provided
    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token.' });
    }
}

module.exports = { protect };