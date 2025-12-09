import { Router } from 'express';
import * as CategoryController from '../../controllers/site/categories.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Category management routes
router.post('/', CategoryController.createCategory);
router.get('/', CategoryController.listCategories);
router.get('/with-counts', CategoryController.listCategoriesWithCounts);
router.post('/generate-slug', CategoryController.generateSlug);
router.post('/reorder', CategoryController.reorderCategories);

router.get('/:id', CategoryController.getCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
