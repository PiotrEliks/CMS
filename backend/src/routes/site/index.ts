import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ scope: 'site' });
});

export default router;
