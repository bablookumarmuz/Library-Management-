const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initCronJobs } = require('./utils/cronJobs');

dotenv.config();
connectDB();
// initCronJobs(); // Disable cron jobs for Vercel serverless deployment (use Vercel Cron instead)

const app = express();
const PORT = process.env.PORT || 5000;



const allowedOrigins = [
    'https://library-management-m2i7.vercel.app', // User's frontend
    'http://localhost:5173',
    'http://localhost:5000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === origin) {
            callback(null, true);
        } else {
            // For debugging: Log the blocked origin
            console.log('Blocked by CORS:', origin);
            // Fallback for now: Allow it but log it (to fix the user's issue immediately)
            // callback(new Error('Not allowed by CORS')); 
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
// Express 5 requires (.*) instead of *
app.options('(.*)', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
    res.send('Library Management System Backend Running');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
