import { Router } from 'express';
import * as MediaController from '../../controllers/media.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Media management routes
router.post('/', MediaController.uploadMedia);
router.get('/', MediaController.listMedia);
router.get('/recent', MediaController.getRecentMedia);
router.get('/stats/storage', MediaController.getStorageStats);
router.get('/type/:mimeType', MediaController.getMediaByType);

router.get('/:id', MediaController.getMedia);
router.put('/:id', MediaController.updateMedia);
router.delete('/:id', MediaController.deleteMedia);

export default router;
