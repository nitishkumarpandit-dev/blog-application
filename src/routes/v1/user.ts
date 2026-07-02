// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import { Router } from 'express';
import { param, query, body } from 'express-validator';

/**
 * Middleware
 */
import authenticate from '@/middleware/authenticate';
import validationError from '@/middleware/validationError';
import authorize from '@/middleware/authorize';

/**
 * Controllers
 */
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';
import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';
import getAllUser from '@/controllers/v1/user/get_all_user';
import getUserById from '@/controllers/v1/user/get_user_by_id';
import deleteUserById from '@/controllers/v1/user/delete_user_by_id';

/**
 * Models
 */
import User from '@/models/user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 characters')
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });

      if (userExists) {
        throw Error('This username is already in use');
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw Error('This email is already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('firstName must be max 20 characters long'),
  body('lastName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('LastName must be max 20 characters long'),
  body(['website', 'facebook', 'instagram', 'youtube', 'x', 'linkedin'])
    .optional()
    .isURL()
    .withMessage('Invalid URL')
    .isLength({ max: 100 })
    .withMessage('URL must be less than 100 characters'),
  validationError,
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be positive integer'),
  getAllUser,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
  validationError,
  getUserById,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
  validationError,
  deleteUserById,
);

export default router;
