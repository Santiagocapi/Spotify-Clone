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

* **REST API Server** with `Node.js` and `Express`.
* **Database Connection** NoSQL (`MongoDB Atlas`).
* **Data Modeling** with Mongoose (Users, Songs, Playlists).
* **User Authentication:**
    * `POST /api/users/register`: Registration of new users with encrypted password (using `bcrypt`).
    * `POST /api/users/login`: User login and generation of "VIP pass" (using `JSON Web Token`).
* **Authorization Middleware:**
    * Protected paths that only authenticated users (with a valid token) can access.
* **Song Management:**
    * `POST /api/songs/upload`: Protected endpoint for uploading `.mp3` files (using `multer`).
    * `GET /api/songs`: Public endpoint for listing all songs in the database.
* **Playlist Management:**
    * `POST /api/playlists`: Protected endpoint to create a new playlist.
    * `GET /api/playlists/my`: Protected endpoint to retrieve all playlists of the logged-in user.
    * `PUT /api/playlists/:id/add`: Protected endpoint to add a song to a user's playlist.

---

## Next Steps (Roadmap)

* **Frontend with React**
    * Initialize the React project in the `/frontend` folder.
    * Create Registration and Login pages.
    * Create the main application layout.
    * Consume the backend API to display songs and playlists.
* **Backend V2**
    * Implement audio streaming by track ranges (instead of serving the entire file).
    * Implement the option for public/private playlists.