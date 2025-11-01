const jwt = require('jsonwebtoken');

// Function takes the user ID as a "payload"
const generateToken = (id) => {
    // jwt.sign() creates a new token
    return jwt.sign({ id }, process.env.JWT_SECRET, { // Only ID is stored in the token
        expiresIn: '30d', // Token expires in 30 days
    });
};

module.exports = generateToken;