const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// Routes
const userRoutes = require('./routes/userRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express application
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Principal routes
app.use('/api/users', userRoutes); // Use user routes for /api/users endpoint

// Start the server
app.get('/', (req, res) => {
  res.send('¡Hola! La API está funcionando.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
