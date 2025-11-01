const express = require('express');
const multer = require('multer');
const router = express.Router(); 
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadSong, getAllSongs } = require('../controllers/songController');

// Configure multer for file uploads

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder for uploaded files 'backend/uploads'
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using the current timestamp and original file name
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter to accept only audio files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Solo se permiten archivos de audio.'), false); // Reject the file
    }
}

// Initialize multer with the defined storage and file filter
const upload = multer ({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
})

// ROUTES

// PUBLIC ROUTES
router.get('/', getAllSongs); // Define the route to get all songs (ENDPOINT)

// PRIVATE ROUTES
router.post('/upload', protect, upload.single('song'), uploadSong); // Define the route for uploading a song (ENDPOINT)

module.exports = router;