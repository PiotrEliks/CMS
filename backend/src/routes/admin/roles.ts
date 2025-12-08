import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as RolesController from '../../controllers/site/roles.controller.js';

const router = Router();

router.get('/', requireAuth, RolesController.getRoles);

export default router;
