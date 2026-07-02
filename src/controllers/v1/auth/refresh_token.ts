// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import {
  verifyRefreshToken,
  verifyAccessToken,
  generateAccessToken,
} from '@/lib/jwt';
/**
 * Modules
 */
import Token from '@/models/token';

/**
 * Types
 */
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    // Varify refresh token
    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again',
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during refresh Token', err);
  }
};

export default refreshToken;
