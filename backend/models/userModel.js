const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Por favor, ingresa un nombre de usuario."],
      unique: true, // Ensure usernames are unique
      trim: true, // Delete leading and trailing whitespace
    },
    email: {
      type: String,
      required: [true, "Por favor, ingresa un correo electrónico."],
      unique: true,
      trim: true,
      lowercase: true, // Convert email to lowercase
    },
    password: {
      type: String,
      required: [true, "Por favor, ingresa una contraseña."],
    },
    likedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    // createAt (date of creation)
    // updateAt (date of last update)
  }
);

module.exports = mongoose.model("User", userSchema);
// Export the User model
