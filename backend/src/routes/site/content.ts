import { Router } from 'express';
import * as ContentController from '../../controllers/site/content.controller.js';

const router = Router();

// Public routes - no authentication required

// List published content
router.get('/', ContentController.listPublishedContents);

// Get content by slug
router.get('/:slug', ContentController.getContentBySlug);

export default router;
