import { Router } from 'express';
import { getMenuByCode, getMenuById } from '../../controllers/site/menus.controller.js';

const r = Router();

r.get('/id/:id', getMenuById);

r.get('/:code', getMenuByCode);

export default r;
