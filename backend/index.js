// backend/index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Required to allow your frontend to talk to this API
app.use(express.json()); // Required to parse incoming JSON payloads


app.get('/', (req, res) => {
  res.status(200).send('ft_transcendence API is running!');
});
// Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    // Ping the database to ensure the connection is active
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'success', message: 'API and Database are online!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});