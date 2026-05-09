require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Рутове
const userRoutes = require('./routes/user.route.js');
const emailRoutes = require('./routes/email.route.js');
const feedbackRoutes = require('./routes/feedback.routes.js');
const notificationRoutes = require('./routes/notification.route.js');
const logsRoutes = require('./routes/adminLogs.route.js');
const savedProfilesRoutes = require('./routes/savedProfiles.route.js');
const osintRoutes = require('./routes/osintRoutes.js');

// Jobs
require('./jobs/deleteUserNotifications.job.js');
require('./jobs/cleanupInactiveUsers.job.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS конфигурация за React (3000) и Vite (5173)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://mern-bulgarian-tourist.onrender.com',
    'https://mern-bulgarian-tourist.vercel.app'
  ],
  credentials: true
}));

const mongoDbConnection = process.env.MONGODB_CONNECTION || process.env.MONGO_URI;

if (!mongoDbConnection) {
    console.error("[-] ERROR: MONGODB_CONNECTION is missing in the .env file!");
    process.exit(1);
}

// Свързване с базата данни (без top-level await, съобразено с CommonJS)
mongoose.connect(mongoDbConnection, {
    family: 4, 
    serverSelectionTimeoutMS: 5000 
})
.then(() => {
    console.log("[+] Successfully connected to MongoDB Atlas!");
})
.catch((error) => {
    console.error("[-] Failed to connect to MongoDB:", error.message);
    process.exit(1);
});

// Глобален Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
  });
});

app.use((req, res, next) => {
  next();
});

// Закачане на всички рутове
app.use('/osint', osintRoutes);
app.use("/users", userRoutes);
app.use('/email', emailRoutes);
app.use("/feedback", feedbackRoutes);
app.use('/notifications', notificationRoutes);
app.use('/saved-profiles', savedProfilesRoutes);
app.use('/logs', logsRoutes);

app.get('/ping', (req, res) => {
  console.log("wake up!");
  res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`[+] Server runs perfectly on port ${PORT}`);
});