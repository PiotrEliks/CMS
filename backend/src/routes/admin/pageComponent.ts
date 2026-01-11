import { Router } from 'express';
import { pageComponentController } from '../../controllers/site/pageComponent.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:componentId', authorize('content.read'), (req, res) =>
  pageComponentController.getComponent(req, res)
);

router.put('/:componentId', authorize('content.update_any'), (req, res) =>
  pageComponentController.updateComponent(req, res)
);

router.delete('/:componentId', authorize('content.delete_any'), (req, res) =>
  pageComponentController.deleteComponent(req, res)
);

router.post('/:componentId/duplicate', authorize('content.create'), (req, res) =>
  pageComponentController.duplicateComponent(req, res)
);

router.patch('/:componentId/toggle', authorize('content.update_any'), (req, res) =>
  pageComponentController.toggleStatus(req, res)
);

router.get('/contents/:contentId/components', authorize('content.read'), (req, res) =>
  pageComponentController.getComponents(req, res)
);

router.post('/contents/:contentId/components', authorize('content.create'), (req, res) =>
  pageComponentController.createComponent(req, res)
);

router.post(
  '/contents/:contentId/components/reorder',
  authorize('content.update_any'),
  (req, res) => pageComponentController.reorderComponents(req, res)
);

router.post('/contents/:contentId/components/bulk', authorize('content.create'), (req, res) =>
  pageComponentController.bulkCreateComponents(req, res)
);

router.delete('/contents/:contentId/components', authorize('content.delete_any'), (req, res) =>
  pageComponentController.deleteAllComponents(req, res)
);

router.get('/contents/:contentId/components/type/:type', authorize('content.read'), (req, res) =>
  pageComponentController.getComponentsByType(req, res)
);

export default router;
