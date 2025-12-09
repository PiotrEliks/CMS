import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as UsersController from '../../controllers/site/users.controller.js';
import { uploadAvatar } from '../../middlewares/updateAvatar.middleware.js';

const router = Router();

// Current user routes (must be before /:id routes)
router.put('/me', requireAuth, UsersController.updateCurrentUser);
router.post('/me/avatar', requireAuth, uploadAvatar, UsersController.updateAvatar);
router.delete('/me/avatar', requireAuth, UsersController.deleteAvatar);

// User CRUD
router.get('/', requireAuth, UsersController.getUsers);
router.post('/add', requireAuth, UsersController.addUser);
router.get('/:id', requireAuth, UsersController.getUser);
router.put('/:id', requireAuth, UsersController.updateUser);
router.delete('/:id', requireAuth, UsersController.deleteUser);

// Password management
router.post('/:id/change-password', requireAuth, UsersController.changePassword);
router.post('/:id/reset-password', requireAuth, UsersController.resetPassword);

// Role management
router.post('/:id/role', requireAuth, UsersController.assignRole);
router.delete('/:id/role', requireAuth, UsersController.removeRole);

// Activation management
router.post('/:id/activate', requireAuth, UsersController.activateUser);
router.post('/:id/deactivate', requireAuth, UsersController.deactivateUser);

export default router;
