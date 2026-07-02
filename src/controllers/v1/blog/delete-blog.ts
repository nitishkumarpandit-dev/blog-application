// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import { v2 as cloudinary } from 'cloudinary';
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
import User from '@/models/user';

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (blog.author.toString() !== userId.toString() && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthenticationError',
        message: 'Access denied, insufficient permission',
      });

      logger.warn('A user tried to delete a blog without permission', {
        userId,
      });
      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);

    logger.info('Blog banner deleted from cloudinary', {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });

    logger.info('Blog deleted successfully', { blogId });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while deleting blog', err);
  }
};

export default deleteBlog;
