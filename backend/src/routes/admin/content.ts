import { Router } from 'express';
import * as ContentController from '../../controllers/site/content.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import contentSectionsRouter from './contentSection.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Content management routes
router.post('/', ContentController.createContent);
router.get('/', ContentController.listContents);
router.post('/generate-slug', ContentController.generateSlug);

router.get('/:id', ContentController.getContent);
router.put('/:id', ContentController.updateContent);
router.delete('/:id', ContentController.deleteContent);

// Publish/Unpublish
router.post('/:id/publish', ContentController.publishContent);
router.post('/:id/unpublish', ContentController.unpublishContent);

// Category management
router.post('/:id/categories/:categoryId', ContentController.attachCategory);
router.delete('/:id/categories/:categoryId', ContentController.detachCategory);

// Media management
router.post('/:id/media/:mediaId', ContentController.attachMedia);
router.delete('/:id/media/:mediaId', ContentController.detachMedia);

router.use('/:contentId/sections', contentSectionsRouter);

export default router;
