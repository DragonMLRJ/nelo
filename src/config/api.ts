// API Configuration for Render.com deployment
const API_CONFIG = {
    // Render URLs (update these after deployment)
    PHP_API: import.meta.env.PROD
        ? 'https://nelo-php-backend.onrender.com'
        : 'http://localhost/api',

    NODE_API: import.meta.env.PROD
        ? 'https://nelo-node-backend.onrender.com'
        : 'http://localhost:3001',

    FRONTEND: import.meta.env.PROD
        ? 'https://nelo-frontend.onrender.com'
        : 'http://localhost:3000'
};

export default API_CONFIG;
