import { Router } from 'express';
import authRouter from './auth.js';
import contentRouter from './content.js';
import categoryRouter from './category.js';
import menuRouter from './menu.js';
import userRouter from './user.js';
import mediaRouter from './media.js';
import roleRouter from './role.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/contents', contentRouter);
router.use('/categories', categoryRouter);
router.use('/menus', menuRouter);
router.use('/users', userRouter);
router.use('/media', mediaRouter);
router.use('/roles', roleRouter);

router.get('/', (_req, res) => {
  res.json({ scope: 'admin' });
});

export default router;
