import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/async';
import { createCategorySchema, updateCategorySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', asyncHandler(controller.getAll));
router.post('/', validate(createCategorySchema), asyncHandler(controller.create));
router.patch('/:id', validate(updateCategorySchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
