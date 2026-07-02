/**
 * @copyright 2026 nitishkumarpandit
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 * Custom Modules
 */
import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

/**
 * Routes
 */
import v1Routes from '@/routes/v1';

/**
 * Types
 */
import type { CorsOptions } from 'cors';

/**
 * Express app initial
 */

const app = express();

// Configure CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINGS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Reject requrest from non-whitelisted origins
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );

      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable JSON request body parsing
app.use(express.json());

// Enable URL-encoded requrest body parsing with extended mode
// `extended: true` allows rich objects and arrays via querystring library
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only compress responses larger then 1KB
  }),
);

// Use helment to enhance security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start the server', err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnection from the database.
 *
 * - Attempts to disconnect from the database before shutting down the server.
 * - Logs a success message if the diconnection is successful.
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exits the process with status code `0` (indicating a successful shutdown)
 */

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown', error);
  }
};

/**
 * Listens for termination signals (`SIGTERM` and `SIGINT`).
 *
 * - `SIGTERM` is typically sent when stopping a process (e.g, `kill` command or container shutdown).
 * - `SIGINT` is triggered when the user interrupts the process (e.g., pressing `Ctrl + C`).
 * - When either signal is received, `handleServerShutdown` is executed to ensure proper cleanup.
 */

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
