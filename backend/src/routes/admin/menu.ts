import { Router } from 'express';
import * as MenuController from '../../controllers/menu.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Menu management routes
router.post('/', MenuController.createMenu);
router.get('/', MenuController.listMenus);

router.get('/:id', MenuController.getMenu);
router.get('/:id/tree', MenuController.getMenuTree);
router.put('/:id', MenuController.updateMenu);
router.delete('/:id', MenuController.deleteMenu);

// Menu item routes
router.post('/:id/items', MenuController.addMenuItem);
router.put('/:menuId/items/:itemId', MenuController.updateMenuItem);
router.post('/:menuId/reorder', MenuController.reorderMenuItems);
router.delete('/:menuId/items/:itemId', MenuController.deleteMenuItem);

export default router;
