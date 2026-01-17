import { Router } from 'express'
import { submitContactForm } from '../../controllers/site/contact.controller.js'

const router = Router()

router.post('/submit', submitContactForm)

export default router
