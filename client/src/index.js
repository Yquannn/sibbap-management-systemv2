import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { register } from './serviceWorker'; // ✅ Import the register function

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Register the service worker
register();
