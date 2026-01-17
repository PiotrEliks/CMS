import { Router } from 'express'
import * as CategoryController from '../../controllers/site/categories.controller.js'

const router = Router()

// Public routes - no authentication required

// List categories
router.get('/', CategoryController.listCategories)

// Get category by slug
router.get('/:slug', CategoryController.getCategoryBySlug)

export default router
