import { Router } from 'express'
import {
    getPageBySlug,
    listPages,
} from '../../controllers/site/pages.controller.js'

const r = Router()
r.get('/', listPages)
r.get('/:slug', getPageBySlug)

export default r
