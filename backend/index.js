const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express application
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Start the server
app.get('/', (req, res) => {
  res.send('¡Hola! La API está funcionando.');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
