import { Router } from 'express';
import authRouter from './auth.js';

const router = Router();

router.use('/auth', authRouter);

router.get('/', (_req, res) => {
  res.json({ scope: 'admin' });
});

export default router;
