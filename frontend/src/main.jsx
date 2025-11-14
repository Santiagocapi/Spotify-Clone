import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import './index.css';
import App from './App.jsx'; 
import Home from './views/Home.jsx';
import Login from './views/Login.jsx';
import Register from './views/Register.jsx'; 

import { AuthProvider } from './context/AuthContext.jsx';

// Map
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      // these are the "child" routes that will be displayed within <App />
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register', 
        element: <Register />, 
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);