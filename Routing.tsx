import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './src/App.tsx';
import WebApp from './Website/src/WebApp.jsx';

function Routing() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/webapp" element={<WebApp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Routing;
