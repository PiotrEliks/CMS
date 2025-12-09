import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as RolesController from '../../controllers/site/roles.controller.js';

const router = Router();

router.get('/', requireAuth, RolesController.getRoles);
router.post('/', requireAuth, RolesController.createRole);
router.get('/:id', requireAuth, RolesController.getRole);
router.put('/:id', requireAuth, RolesController.updateRole);
router.delete('/:id', requireAuth, RolesController.deleteRole);

// Permission management
router.post('/:id/permissions', requireAuth, RolesController.addPermission);
router.get('/:id/permissions/:permission', requireAuth, RolesController.checkPermission);
router.delete('/:id/permissions/:permission', requireAuth, RolesController.removePermission);

export default router;
