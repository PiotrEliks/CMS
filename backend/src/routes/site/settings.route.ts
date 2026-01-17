import { Router, Request, Response } from 'express';
import { siteSettingsService } from '../../services/siteSettings.service.js';

const router = Router();

// GET /api/sites/settings - Get all public site settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await siteSettingsService.getPublic();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// GET /api/sites/settings/:key - Get single setting by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = await siteSettingsService.get(key);
    res.json({ key, value: value || {} });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

export default router;
