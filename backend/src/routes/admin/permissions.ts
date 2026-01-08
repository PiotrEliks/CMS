import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import * as PermissionsController from '../../controllers/site/permissions.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  authorize('roles.assign_permissions'),
  PermissionsController.listPermissions
);

export default router;
