import { Router } from 'express';
import authRouter from './auth.js';
import usersRouter from './users.js';
import rolesRouter from './roles.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);

router.get('/', (_req, res) => {
  res.json({ scope: 'admin' });
});

export default router;
