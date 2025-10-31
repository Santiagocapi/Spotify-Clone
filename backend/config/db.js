const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error al conectar a MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

// Export the connectDB function
module.exports = connectDB;