// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import { Router } from 'express';
import { body, param } from 'express-validator';
/**
 * Controllers
 */
import likeBlogPost from '@/controllers/v1/like/like_blog_post';
import unlikeBlogPost from '@/controllers/v1/like/unlike_blog_post';
/**
 * Middleware
 */
import authenticate from '@/middleware/authenticate';
import authorize from '@/middleware/authorize';
import validationError from '@/middleware/validationError';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog Id'),
  validationError,
  likeBlogPost,
);

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog Id'),
  validationError,
  unlikeBlogPost,
);

export default router;
