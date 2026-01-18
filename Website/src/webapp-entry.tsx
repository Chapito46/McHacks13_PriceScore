// src/webapp-entry.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import WebApp from './WebApp.jsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WebApp />
    </React.StrictMode>
);
