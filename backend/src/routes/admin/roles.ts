import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as RolesController from '../../controllers/site/roles.controller.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', requireAuth, authorize('roles.read'), RolesController.getRoles);
router.post('/', requireAuth, authorize('roles.create'), RolesController.createRole);
router.get('/:id', requireAuth, authorize('roles.read'), RolesController.getRole);
router.put('/:id', requireAuth, authorize('roles.update'), RolesController.updateRole);
router.delete('/:id', requireAuth, authorize('roles.delete'), RolesController.deleteRole);

router.put(
  '/:id/permissions',
  requireAuth,
  authorize('roles.assign_permissions'),
  RolesController.updateRolePermissions
);
router.get(
  '/:id/permissions',
  requireAuth,
  authorize('roles.read'),
  RolesController.getRolePermissions
);

export default router;
