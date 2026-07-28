import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/async';
import { createIncomeSchema, updateIncomeSchema, incomesQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', validate(incomesQuerySchema, 'query'), asyncHandler(controller.getAll));
router.post('/', validate(createIncomeSchema), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.patch('/:id', validate(updateIncomeSchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
