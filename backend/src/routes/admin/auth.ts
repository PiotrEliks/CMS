import { Router } from 'express'
import * as AuthController from '../../controllers/auth.controller.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', AuthController.login)
router.post('/logout', requireAuth, AuthController.logout)
router.get('/check', requireAuth, AuthController.checkAuth)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

export default router
