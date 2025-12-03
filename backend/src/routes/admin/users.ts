import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as UsersController from '../../controllers/site/users.controller.js';

const router = Router();

router.put('/me', requireAuth, UsersController.updateCurrentUser);
router.get('/', requireAuth, UsersController.getUsers);
router.get('/:id', requireAuth, UsersController.getUser);
router.post('/add', requireAuth, UsersController.addUser);
router.put('/:id', requireAuth, UsersController.updateUser);
router.delete('/:id', requireAuth, UsersController.deleteUser);

export default router;
