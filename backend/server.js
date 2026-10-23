
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Startup Security Validation: Ensure JWT_SECRET is properly configured
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || typeof jwtSecret !== 'string' || !jwtSecret.trim() || jwtSecret.trim() === 'secret_key') {
    console.error('================================================================================');
    console.error('FATAL STARTUP ERROR: JWT_SECRET is missing, empty, or insecure.');
    console.error('AdhikarAI requires a strong, non-default JWT_SECRET to protect user authentication.');
    console.error('Please configure a valid JWT_SECRET in backend/.env before starting the server.');
    console.error('Refer to backend/.env.example for required environment variable settings.');
    console.error('================================================================================');
    process.exit(1);
}

const app = express();
const schemeRoutes = require('./routes/schemeRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const scamRoutes = require('./routes/scamRoutes');
const PORT = process.env.PORT || 3000;

// Middleware: CORS Configuration with Explicit Origin Whitelist
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
];

if (process.env.FRONTEND_URL && typeof process.env.FRONTEND_URL === 'string' && process.env.FRONTEND_URL.trim()) {
    const customFrontend = process.env.FRONTEND_URL.trim();
    if (!allowedOrigins.includes(customFrontend)) {
        allowedOrigins.push(customFrontend);
    }
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Register APIs
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', schemeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/scam', scamRoutes);

// Health-check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'AdhikarAI backend is running!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AdhikarAI backend running on port ${PORT}`);
});
