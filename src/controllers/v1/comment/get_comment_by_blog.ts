// Copyright 2026 nitishkumarpandit

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Types
 */
import type { Request, Response } from 'express';
import type { IComment } from '@/models/comment';
/**
 * Models
 */
import Blog from '@/models/blog';
import Comment from '@/models/comment';

const getCommentsByBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      comments: allComments,
    });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while fetching comment by blog', err);
  }
};

export default getCommentsByBlog;
