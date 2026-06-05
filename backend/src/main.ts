import 'dotenv/config';
import http from 'http';
import express, { Express } from 'express';
import { config } from './config/environment';
import { createServer as createExpressServer } from './config/server';
import { initializeSocket } from './websocket/io-setup';
import { setupQueueHandlers } from './websocket/handlers/queueHandler';
import { createRoutes } from './routes';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { Socket } from 'socket.io';
import { mountRokuWs } from './roku.ws';

async function createApplication(): Promise<{ app: Express; server: http.Server }> {
  // Create Express app
  const app = createExpressServer();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = initializeSocket(server);

  // Mount Roku WebSocket endpoint
  mountRokuWs(server, io);

  // Socket.IO connection handler
  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Setup queue handlers
    setupQueueHandlers(socket);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Routes
  app.use('/api/v1', createRoutes());

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return { app, server };
}

async function startServer(): Promise<void> {
  try {
    const { app, server } = await createApplication();

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Start listening
    server.listen(config.PORT, () => {
      logger.info(`
╔════════════════════════════════════════════╗
║   🚀 Backend Started Successfully         ║
╠════════════════════════════════════════════╣
║ 📡 WebSocket: ws://localhost:${config.PORT}
║ 🔗 HTTP: http://localhost:${config.PORT}
║ 📦 CORS Origin: ${config.CORS_ORIGIN}
║ 🌍 Environment: ${config.NODE_ENV}
║ 📚 API Version: ${config.API_VERSION}
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the application
startServer();

