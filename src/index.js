import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseProvider } from './context/Firebase';
import { ToastContainer } from 'react-toastify';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <FirebaseProvider>
        <App />
      <ToastContainer/>
    </FirebaseProvider>
  </BrowserRouter>
);