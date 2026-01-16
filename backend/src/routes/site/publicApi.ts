import { Router } from 'express'
import { publicApiController } from '../../controllers/site/publicApi.controller.js'

const router = Router()

router.get('/public/homepage', (req, res) =>
    publicApiController.getHomepage(req, res)
)

router.get('/public/pages', (req, res) =>
    publicApiController.getPages(req, res)
)
router.get('/public/pages/:slug', (req, res) =>
    publicApiController.getPage(req, res)
)
router.get('/public/pages/:slug/sections', (req, res) =>
    publicApiController.getPageWithSections(req, res)
)
router.get('/public/pages/:slug/components', (req, res) =>
    publicApiController.getPageWithComponents(req, res)
)
router.get('/public/pages/:id/related', (req, res) =>
    publicApiController.getRelatedPages(req, res)
)

router.get('/public/menus/:code', (req, res) =>
    publicApiController.getMenu(req, res)
)

router.get('/public/categories', (req, res) =>
    publicApiController.getCategories(req, res)
)
router.get('/public/categories/:slug/contents', (req, res) =>
    publicApiController.getCategoryContents(req, res)
)

router.get('/public/search', (req, res) => publicApiController.search(req, res))

export default router
