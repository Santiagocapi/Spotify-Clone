const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
// Routes
const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express application
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Principal routes
app.use('/api/users', userRoutes); // Use user routes for /api/users endpoint
app.use('/api/songs', songRoutes); // Use song routes for /api/songs endpoint

// Start the server
app.get('/', (req, res) => {
  res.send('¡Hola! La API está funcionando.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
