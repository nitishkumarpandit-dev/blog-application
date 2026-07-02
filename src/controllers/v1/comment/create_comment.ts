// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

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

type CommentData = Pick<IComment, 'content'>;

/*
 * Purify the comment content
 */
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const createComment = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const { content } = req.body as CommentData;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId,
    });

    logger.info('New comment create', newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info('Blog comments count update', {
      blogId: blog._id,
      commentCount: blog.commentsCount,
    });

    res.status(201).json({
      comment: newComment,
    });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while creation comment', err);
  }
};

export default createComment;
