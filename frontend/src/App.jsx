import React from 'react';
import { Outlet } from 'react-router-dom';
import './index.css'

function App() {
  return (
    <div>
      <header className="app-header">
        <h1>Spotify Clone</h1>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;