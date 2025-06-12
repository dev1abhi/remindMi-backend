const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const checks = {
    server: true,
    mongo: mongoose.connection.readyState === 1,
    envVars: !!(process.env.MONGODB_URI && process.env.NOTIFICATIONAPI_CLIENT_ID),
  };

  const allHealthy = Object.values(checks).every(Boolean);

  const getStatusHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RemindMi Backend Health</title>
      <style>
        body {
          background-color: #1a202c;
          color: #f7fafc;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
        }
        h1 {
          color: ${allHealthy ? '#38bdf8' : '#f87171'};
          font-size: 2rem;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: 0.5rem 0;
        }
        .ok {
          color: #4ade80;
        }
        .fail {
          color: #f87171;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${allHealthy ? '✅ RemindMi Backend is Healthy' : '⚠️ RemindMi Backend Has Issues'}</h1>
        <ul>
          <li>🖥️ Server: <span class="${checks.server ? 'ok' : 'fail'}">${checks.server ? 'OK' : 'DOWN'}</span></li>
          <li>📦 MongoDB: <span class="${checks.mongo ? 'ok' : 'fail'}">${checks.mongo ? 'Connected' : 'Disconnected'}</span></li>
          <li>🔐 Env Vars: <span class="${checks.envVars ? 'ok' : 'fail'}">${checks.envVars ? 'OK' : 'Missing'}</span></li>
        </ul>
        <p>${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  res.send(getStatusHTML());
});

module.exports = router;
