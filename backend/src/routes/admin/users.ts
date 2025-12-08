import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as UsersController from '../../controllers/site/users.controller.js';
import { uploadAvatar } from '../../middlewares/updateAvatar.middleware.js';

const router = Router();

router.put('/me', requireAuth, UsersController.updateCurrentUser);
router.get('/', requireAuth, UsersController.getUsers);
router.get('/:id', requireAuth, UsersController.getUser);
router.post('/add', requireAuth, UsersController.addUser);
router.put('/:id', requireAuth, UsersController.updateUser);
router.delete('/:id', requireAuth, UsersController.deleteUser);
router.post('/me/avatar', requireAuth, uploadAvatar, UsersController.updateAvatar);
router.delete('/me/avatar', requireAuth, UsersController.deleteAvatar);

router.post('/:id/change-password', UsersController.changePassword);
router.post('/:id/reset-password', UsersController.resetPassword);

router.post('/:id/role', UsersController.assignRole);
router.delete('/:id/role', UsersController.removeRole);

router.post('/:id/activate', UsersController.activateUser);
router.post('/:id/deactivate', UsersController.deactivateUser);
export default router;
