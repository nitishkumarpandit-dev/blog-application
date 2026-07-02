// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom Modules
 */
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

/**
 * Types
 */

import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

/**
 * @function authenticate
 * @description Middleware to verify the user's access token from the Authentication header. If the token is valid, the user's Id is attached to the request object. Otherwise, it returns an appropriate error response.
 * @param {Request} req - Express request object. Expects a Bearer token in the Authorization header.
 * @param {Response} res - Express response object used to send error responses if authentication fails.
 * @param {NextFunction} next - Express next function to pass control to the next middleware.
 * @return {void}
 */

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If there's no Bearer token, respond with 401 Unauthorized
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
  }

  // Split out the token from the 'Bearer' prefix
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }

  try {
    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // Attach the userId to the request object for latter use
    req.userId = jwtPayload.userId;

    // Proceed to the next middleware or route handler
    return next();
  } catch (err) {
    // Handle expired token error
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired',
      });
      return;
    }

    // Handle invalid token error
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid',
      });
      return;
    }

    // Catch-all for other errors
    res.status(500).json({
      code: 'ServerError',
      message: 'Interval server error',
      error: err,
    });

    logger.error('Error during authentication', err);
  }
};

export default authenticate;
