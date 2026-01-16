import { Router } from 'express'
import { categoryController } from '../../controllers/site/category.controller.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'

const router = Router()
router.get('/categories/tree', (req, res) =>
    categoryController.getCategoryTree(req, res)
)
router.get('/categories/slug/:slug', (req, res) =>
    categoryController.getCategoryBySlug(req, res)
)

router.use(requireAuth)

router.get('/', authorize('category.read'), (req, res) =>
    categoryController.getCategories(req, res)
)

router.get('/:id', authorize('category.read'), (req, res) =>
    categoryController.getCategory(req, res)
)

router.post('/', authorize('category.create'), (req, res) =>
    categoryController.createCategory(req, res)
)

router.put('/:id', authorize('category.update'), (req, res) =>
    categoryController.updateCategory(req, res)
)

router.delete('/:id', authorize('category.delete'), (req, res) =>
    categoryController.deleteCategory(req, res)
)

router.get('/:id/contents', authorize('category.read'), (req, res) =>
    categoryController.getContentsByCategory(req, res)
)

router.get(
    '/contents/:contentId/categories',
    authorize('content.read'),
    (req, res) => categoryController.getCategoriesByContent(req, res)
)

router.post(
    '/contents/:contentId/categories',
    authorize('content.update_any'),
    (req, res) => categoryController.assignCategoriesToContent(req, res)
)

router.delete(
    '/contents/:contentId/categories/:categoryId',
    authorize('content.update_any'),
    (req, res) => categoryController.removeCategoryFromContent(req, res)
)

export default router
