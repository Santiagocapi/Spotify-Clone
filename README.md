# Spotify-Clone (Personal Music Player)

This is a full-stack portfolio project consisting of a personal music player inspired by Spotify. The application allows users to register, upload their own songs, and create custom playlists.

---

## Technology Stack

This project is built using the MERN stack (MongoDB, Express, React, Node.js) along with other development tools.

### Backend

- **[Node.js](https://nodejs.org/)**
- **[Express.js](https://expressjs.com/)**
- **[bcrypt.js](https://www.npmjs.com/package/bcryptjs)**: Library for encrypting ("hashing") passwords.
- **[JSON Web Token (JWT)](https://jwt.io/)**: To generate secure "access tokens" for route authentication.
- **[Multer](https://www.npmjs.com/package/multer)**: Middleware for handling file uploads (`multipart/form-data`).
- **[dotenv](https://www.npmjs.com/package/dotenv)**: To handle environment variables (API keys, secrets).

### Database

- **[Mongoose](https://mongoosejs.com/)**
- **[MongoDB Atlas](https://www.mongodb.com/atlas)**

### Frontend

- **[React.js](https://reactjs.org/)**: JavaScript library for building the user interface.
- **[React Router Dom](https://reactrouter.com/)**: For customer-side routing (SPA).
- **[Axios](https://axios-http.com/)**: HTTP client to consume the backend API.
- **React Context API**: For global state management (AuthContext).
- **CSS Modules**: For "scoped" (local) styles per component. (For now)

### Development Tools

- **[Git](https://git-scm.com/)**
- **[GitHub](https://github.com/)**
- **[Nodemon](https://www.npmjs.com/package/nodemon)**
- **[Insomnia](https://insomnia.rest/)**: API client for testing and debugging endpoints.

---

## Implemented Functionalities

### Backend

- **REST API Server** with `Node.js` and `Express`.

- **Database Connection** NoSQL (`MongoDB Atlas`).

- **Data Modeling** with Mongoose (Users, Songs, Playlists).

- **User Authentication:**

  - `POST /api/users/register`: Registration of new users with encrypted password (using `bcrypt`).
  - `POST /api/users/login`: User login and generation of "VIP pass" (using `JSON Web Token`).

- **Authorization Middleware:**

  - Protected paths that only authenticated users (with a valid token) can access.

- **Song Management:**

  - `POST /api/songs/upload`: Protected endpoint for uploading `.mp3` files (using `multer`).
  - `GET /api/songs`: Public endpoint for listing all songs in the database.

- **Playlist Management:**

  - `POST /api/playlists`: Protected endpoint to create a new playlist.
  - `GET /api/playlists/my`: Protected endpoint to retrieve all playlists of the logged-in user.
  - `PUT /api/playlists/:id/add`: Protected endpoint to add a song to a user's playlist.

### Frontend (In Progress)

- **Project Setup** with Vite and React.

- **Routing**:

  - Configuration of `react-router-dom` with a main layout (`App.jsx`) and nested routes (`Home`, `Login`, `Register`).

- **Authentication Forms**:

  - `Register.jsx` component with `useState` and `axios` to connect to the backend.
  - `Login.jsx` component with `useState` and `axios`.

- **Global Authentication State**:

  - Created using `AuthContext.jsx` with `useReducer` and `useContext`.
  - The app is "wrapped" within the `AuthProvider`.
  - Login updates the global state and saves it to `localStorage`.
  - The app reads `localStorage` on startup to keep the user logged in.
  - Protected Routes (`ProtectedRoute`) and Public Routes (`PublicRoute`).
  - Dynamic header with Logout button.

- **Dashboard (Home)**:

  - Use the public API (`GET /api/songs`) to display the song catalog.
  - Use the private API (`GET /api/playlists/my`) to display the user's playlists.

- **Content Management**:

  - Playlist Management: Create playlists, delete playlists, view details.
  - Upload Music: Form to send files to the server.
  - Interactivity: Add songs to playlists from the Home screen (`Modal`) or from the Playlist.

- **Music Player**:

  - Persistent component (does not stop while browsing).
  - Play/Pause control.
  - Volume control.
  - Visual progress bar.

---

## Next Steps (Roadmap)

- **Frontend - Interactivity:**

  - Implement a component library
  - Improve responsive design (Mobile/Desktop).
  - Add icons (Play, Pause, Trash, etc.) using `react-icons`.

- **Extra Features:**

  - Search bar (filter songs by name).
  - Drag & Drop to upload songs.

- **Backend V2** (Optional)

  - Use metadata to extract information from the uploaded files.
  - Implement audio streaming by track ranges (instead of serving the entire file).
  - Implement the option for public/private playlists.

- **Deployment (Deploy):**
  - Publish Backend (Render/Railway).
  - Publish Frontend (Vercel/Netlify).
