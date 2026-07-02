// Copyright 2026 nitishkumarpandit

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Types
 */
import type { Request, Response } from 'express';
/**
 * Models
 */
import Blog from '@/models/blog';
import Like from '@/models/like';

const unlikeBlogPost = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;
  try {
    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();

    if (!existingLike) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Like not found',
      });
      return;
    }

    await Like.deleteOne({ _id: existingLike._id });

    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Like not found',
      });
      return;
    }

    blog.likesCount--;
    await blog.save();

    logger.info('Blog unliked successfully', {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while unliking blog', err);
  }
};

export default unlikeBlogPost;
