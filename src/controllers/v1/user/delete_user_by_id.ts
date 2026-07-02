// Copyright 2026 nitishkumarpandit
/**
 * Node modules
 */
import { v2 as cloudinary } from 'cloudinary';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import User from '@/models/user';
import Blog from '@/models/blog';
/**
 * Types
 */
import type { Request, Response } from 'express';

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      res.status(404).json({
        code: 'Not found',
        message: 'Current user not found',
      });
      return;
    }

    if (currentUser.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permission',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    await User.deleteOne({ _id: userId });

    logger.info('A user account has been deleted', { userId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while getting user by Id', err);
  }
};

export default deleteUserById;
