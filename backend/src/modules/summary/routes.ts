import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/async';
import { monthQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', validate(monthQuerySchema, 'query'), asyncHandler(controller.monthlySummary));
router.get('/by-category', validate(monthQuerySchema, 'query'), asyncHandler(controller.byCategory));
router.get('/by-source', validate(monthQuerySchema, 'query'), asyncHandler(controller.bySource));
router.get('/recurring', asyncHandler(controller.recurring));

export default router;
