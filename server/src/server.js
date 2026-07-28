require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io powers real-time features: collaborative playlist editing
// (live track add/remove/reorder broadcasts to everyone viewing the playlist).
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('playlist:join', (playlistId) => {
    socket.join(`playlist:${playlistId}`);
  });

  socket.on('playlist:leave', (playlistId) => {
    socket.leave(`playlist:${playlistId}`);
  });

  socket.on('playlist:update', ({ playlistId, action, payload }) => {
    socket.to(`playlist:${playlistId}`).emit('playlist:update', { action, payload });
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Phonkify API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = server;
