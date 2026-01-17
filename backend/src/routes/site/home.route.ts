import { Router } from 'express'
import { getHome } from '../../controllers/site/home.controller.js'

const r = Router()
r.get('/', getHome)

export default r
