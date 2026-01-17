import { Router } from 'express'
import { menuController } from '../../controllers/site/menu.controller.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'

const router = Router()

router.get('/code/:code/items', (req, res) =>
  menuController.getMenuByCodeWithItems(req, res)
)

router.use(requireAuth)

router.get('/', authorize('menu.read'), (req, res) =>
  menuController.getMenus(req, res)
)

router.get('/:id', authorize('menu.read'), (req, res) =>
  menuController.getMenu(req, res)
)

router.get('/code/:code', authorize('menu.read'), (req, res) =>
  menuController.getMenuByCode(req, res)
)

router.post('/', authorize('menu.create'), (req, res) =>
  menuController.createMenu(req, res)
)

router.put('/:id', authorize('menu.update'), (req, res) =>
  menuController.updateMenu(req, res)
)

router.delete('/:id', authorize('menu.delete'), (req, res) =>
  menuController.deleteMenu(req, res)
)

router.get('/:id/items', authorize('menu.read'), (req, res) =>
  menuController.getMenuWithItems(req, res)
)

router.post('/:menuId/items', authorize('menu.create'), (req, res) =>
  menuController.createMenuItem(req, res)
)

router.put('/menu-items/:id', authorize('menu.update'), (req, res) =>
  menuController.updateMenuItem(req, res)
)

router.delete('/menu-items/:id', authorize('menu.delete'), (req, res) =>
  menuController.deleteMenuItem(req, res)
)

router.post('/:menuId/items/reorder', authorize('menu.update'), (req, res) =>
  menuController.reorderMenuItems(req, res)
)

router.post('/menu-items/:id/duplicate', authorize('menu.create'), (req, res) =>
  menuController.duplicateMenuItem(req, res)
)

router.patch('/menu-items/:id/toggle', authorize('menu.update'), (req, res) =>
  menuController.toggleMenuItem(req, res)
)

export default router
