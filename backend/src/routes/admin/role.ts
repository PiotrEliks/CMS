import { Router } from 'express';
import * as RoleController from '../../controllers/role.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Role management routes
router.post('/', RoleController.createRole);
router.get('/', RoleController.listRoles);

router.get('/:id', RoleController.getRole);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

// Permission management
router.post('/:id/permissions', RoleController.addPermission);
router.get('/:id/permissions/:permission', RoleController.checkPermission);
router.delete('/:id/permissions/:permission', RoleController.removePermission);

export default router;
