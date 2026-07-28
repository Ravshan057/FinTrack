import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/async';
import { createExpenseSchema, updateExpenseSchema, expensesQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', validate(expensesQuerySchema, 'query'), asyncHandler(controller.getAll));
router.post('/', validate(createExpenseSchema), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.patch('/:id', validate(updateExpenseSchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
