import { Router } from 'express'
import { getCategory } from '../../controllers/site/categories.controller.js'

const r = Router()
r.get('/:slug', getCategory)

export default r
