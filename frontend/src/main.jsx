import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import views
import "./index.css";
import App from "./App.jsx";
import Home from "./views/Home.jsx";
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import UploadSong from "./views/UploadSong.jsx";

// Import Context
import { AuthProvider } from "./context/AuthContext.jsx";

// Import Guards
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

// Map
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/upload",
            element: <UploadSong />,
          },
          // Playlists
        ],
      },

      // Public Routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
