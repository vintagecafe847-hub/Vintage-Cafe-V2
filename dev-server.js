// Local development server for testing the API endpoint
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables
require('dotenv').config();

// Import the API handler
const apiHandler = require('./api/send-contact-email.js');

// API route
app.post('/api/send-contact-email', (req, res) => {
  // Create a mock Vercel-style req/res objects
  const mockReq = {
    method: 'POST',
    body: req.body,
  };

  const mockRes = {
    setHeader: (key, value) => res.setHeader(key, value),
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end(),
    }),
  };

  apiHandler(mockReq, mockRes);
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log(
    'API endpoint available at http://localhost:' +
      PORT +
      '/api/send-contact-email'
  );
});
