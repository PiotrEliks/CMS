import { Router } from 'express'
import authRouter from './auth.js'
import contentRouter from './content.js'
import categoryRouter from './category.js'
import menuRouter from './menu.js'
import userRouter from './users.js'
import mediaRouter from './media.js'
import roleRouter from './roles.js'
import permissionsRouter from './permissions.js'
import pageComponentRouter from './pageComponent.js'
import settingsRouter from './siteSettings.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/contents', contentRouter)
router.use('/categories', categoryRouter)
router.use('/menus', menuRouter)
router.use('/users', userRouter)
router.use('/media', mediaRouter)
router.use('/roles', roleRouter)
router.use('/permissions', permissionsRouter)
router.use('/components', pageComponentRouter)
router.use('/settings', settingsRouter)

router.get('/', (_req, res) => {
    res.json({ scope: 'admin' })
})

export default router
