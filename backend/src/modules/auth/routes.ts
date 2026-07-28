import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/async';
import { auth } from '../../middleware/auth';
import { registerSchema, loginSchema } from './schema';
import * as authController from './controller';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.get('/me', auth, asyncHandler(authController.me));

export default router;
