import { Router } from 'express';
import categoryRouter from './categoryRouter.js';
import gamesRouter from './gamesRouter.js';
import customersRouter from './customersRouter.js';
import rentalsRouter from './rentalsRouter.js';

const router = Router();
router.use(categoryRouter); // Create/Read
router.use(gamesRouter); // Create/Read
router.use(customersRouter); // Create/Read/Update
router.use(rentalsRouter); // Create/Read/Update/Delete

export default router;








