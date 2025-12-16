# OurMusic - Spotify Clone

A modern, full-stack music streaming application built with the **MERN stack** (MongoDB, Express, React, Node.js). This project replicates core Spotify functionalities with a custom "Nordic Beige" aesthetic, featuring user authentication, playlist management, and a robust "Liked Songs" system.

---

## Features

### User Authentication

- **Secure Login/Register:** JWT-based authentication with bcrypt password hashing.
- **Protected Routes:** Middleware to secure API endpoints and frontend pages.

### Music Player & Library

- **Global Player:** Persistent playback bar enabling music control across pages.
- **Song Management:** Upload and manage tracks (MP3) with cover art.
- **Dynamic Sidebar:** Real-time navigation showing your library and created playlists.

### Liked Songs System

- **One-Click Likes:** Add songs to your favorites instantly from any view.
- **Dedicated Collection:** Access all your liked tracks in a specialized "Liked Songs" playlist.
- **Smart Indicators:** Visual feedback (filled hearts) showing liked status across the app.

### Advanced Playlist Management

- **Create & Delete:** Users can create unlimited personal playlists.
- **Customization:** Edit playlist details including **Title**, **Description**, and **Custom Cover Image**.
- **Song Curation:** Search and add songs directly to specific playlists or remove them easily.
- **Visuals:** Auto-generated covers or custom uploaded images for playlists.

### UI/UX Design

- **Nordic Beige Theme:** A custom, warm color palette using Tailwind CSS variables.
- **Shadcn UI Components:** Polished, accessible components (Dialogs, Tables, Tooltips).
- **Responsive Design:** Optimized layout for different screen sizes.

---

## Technology Stack

### Frontend

- **[React.js](https://reactjs.org/)**: JavaScript library for building the user interface.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
- **[Shadcn UI](https://ui.shadcn.com/)**: A collection of free and open source components.
- **[Lucide React](https://lucide.dev/)**: A collection of free and open source icons.
- **[React Router Dom](https://reactrouter.com/)**: For customer-side routing (SPA).
- **[Axios](https://axios-http.com/)**: HTTP client to consume the backend API.
- **React Context API**: For global state management (AuthContext).

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

### Development Tools

- **[Git](https://git-scm.com/)**
- **[GitHub](https://github.com/)**
- **[Nodemon](https://www.npmjs.com/package/nodemon)**
- **[Insomnia](https://insomnia.rest/)**: API client for testing and debugging endpoints.

---

## Installation & Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Santiagocapi/Spotify-Clone.git
    cd Spotify-Clone
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    npm install
    # Create a .env file with: MONGO_URI, JWT_SECRET
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## Next Steps (Roadmap)

- **Frontend - Interactivity:**

  - Real-time search and filtering bar.
  - Drag and drop for uploading songs.
  - User profile (Avatar) editing.
  - Improve responsive design (Mobile/Desktop).

- **Backend V2** (Optional)

  - Use metadata to extract information from the uploaded files.
  - Implement audio streaming by track ranges (instead of serving the entire file).
  - Implement the option for public/private playlists.

- **Deployment (Deploy):**
  - Publish Backend (Render/Railway).
  - Publish Frontend (Vercel/Netlify).
