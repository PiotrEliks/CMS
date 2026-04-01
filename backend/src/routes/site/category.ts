import { Router } from 'express'
import * as CategoryController from '../../controllers/site/categories.controller.js'

const router = Router()

router.get('/', CategoryController.listCategories)

router.get('/:slug', CategoryController.getPublishedCategory)

export default router
