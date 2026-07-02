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
 * model
 */
import User from '@/models/user';
import Blog from '@/models/blog';
/**
 * Types
 */
import type { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        code: 'Not Found',
        message: 'User not Found',
      });
      return;
    }

    if (user.role === 'admin') {
      const blogs = await Blog.find({ author: userId })
        .select('banner.publicId')
        .lean()
        .exec();

      const publicIds = blogs.map(({ banner }) => banner.publicId);

      await cloudinary.api.delete_resources(publicIds);

      logger.info('Multiple blog banners deleted from cloudinary', {
        publicIds,
      });

      await Blog.deleteMany({ author: userId });

      logger.info('Multiple blogs deleted', { userId, blogs });
    }

    await User.deleteOne({ _id: userId });

    logger.info('A user account has been deleted', {
      userId,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while deleting current user', err);
  }
};

export default deleteCurrentUser;
