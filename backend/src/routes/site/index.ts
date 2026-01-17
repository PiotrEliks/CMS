import { Router } from 'express'
import pagesRoutes from './pages.route.js'
import menusRoutes from './menus.route.js'
import categoriesRoutes from './categories.route.js'
import mediaRoutes from './media.route.js'
import homeRoutes from './home.route.js'
import contentRouter from './content.js'
import categoryRouter from './category.js'
import settingsRouter from './settings.route.js'

const router = Router()

router.use('/pages', pagesRoutes)
router.use('/menus', menusRoutes)
router.use('/categories', categoriesRoutes)
router.use('/media', mediaRoutes)
router.use('/home', homeRoutes)
router.use('/contents', contentRouter)
router.use('/category', categoryRouter)
router.use('/settings', settingsRouter)

router.get('/', (_req, res) => {
  res.json({ scope: 'site' })
})

export default router
