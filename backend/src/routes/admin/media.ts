import { Router } from 'express';
import multer from 'multer';
import * as MediaController from '../../controllers/site/media.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { uploadMediaMiddleware } from '../../middlewares/uploadMedia.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Media management routes
router.post(
  '/',
  authorize('media.upload'),
  (req, res, next) => {
    uploadMediaMiddleware.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Plik za duży. Max: 50MB',
          });
        }
        return res.status(400).json({
          error: `Upload error: ${err.message}`,
        });
      }
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
  },
  MediaController.uploadMedia
);
router.get('/', authorize('media.read'), MediaController.listMedia);
router.get('/recent', authorize('media.read'), MediaController.getRecentMedia);
router.get('/stats/storage', authorize('media.read'), MediaController.getStorageStats);
router.get('/type/:mimeType', authorize('media.read'), MediaController.getMediaByType);

router.get('/:id', authorize('media.read'), MediaController.getMedia);
router.put('/:id', authorize('media.update'), MediaController.updateMedia);
router.delete('/:id', authorize('media.delete'), MediaController.deleteMedia);

export default router;
