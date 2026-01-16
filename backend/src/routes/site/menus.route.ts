import { Router } from 'express'
import { getMenuByCode } from '../../controllers/site/menus.controller.js'

const r = Router()
r.get('/:code', getMenuByCode)

export default r
