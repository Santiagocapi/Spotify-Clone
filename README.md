# Spotify-Clone (Personal Music Player)

This is a full-stack portfolio project consisting of a personal music player inspired by Spotify. The application allows users to register, upload their own songs, and create custom playlists.

---

## Technology Stack

This project is built using the MERN stack (MongoDB, Express, React, Node.js) along with other development tools.

### Backend

* **[Node.js](https://nodejs.org/)**
* **[Express.js](https://expressjs.com/)**
* **[bcrypt.js](https://www.npmjs.com/package/bcryptjs)**: Library for encrypting ("hashing") passwords.
* **[JSON Web Token (JWT)](https://jwt.io/)**: To generate secure "access tokens" for route authentication.
* **[Multer](https://www.npmjs.com/package/multer)**: Middleware for handling file uploads (`multipart/form-data`).
* **[dotenv](https://www.npmjs.com/package/dotenv)**: To handle environment variables (API keys, secrets).

### Database

* **[Mongoose](https://mongoosejs.com/)**
* **[MongoDB Atlas](https://www.mongodb.com/atlas)**

### Frontend (Planned)

* **[React.js](https://reactjs.org/)**: JavaScript library for building the user interface.

### Development Tools

* **[Git](https://git-scm.com/)**
* **[GitHub](https://github.com/)**
* **[Nodemon](https://www.npmjs.com/package/nodemon)**
* **[Insomnia](https://insomnia.rest/)**: API client for testing and debugging endpoints.

---

## Implemented Functionalities (Backend)

* **REST API Server** with Node.js Express.
* **Database Connection** NoSQL (MongoDB Atlas).
* **Data Modeling** with Mongoose (Users, Songs, Playlists).
* **User Authentication:**
    * `POST /api/users/register`: Registration of new users with encrypted password (bcrypt).
    * `POST /api/users/login`: User login and generation of "VIP pass" (JSON Web Token).
* **Authorization Middleware:**
    * Protected paths that only authenticated users (with a valid token) can access.
* **Song Management:**
    * `POST /api/songs/upload`: Protected endpoint for uploading `.mp3` files (using `multer`).
    * `GET /api/songs`: Public endpoint for listing all songs in the database.