import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css'; // Importing the main CSS file
import React from 'react';
import Routing from './Routing';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
        >
            <Routing />
        </Auth0Provider>
    </StrictMode>
);