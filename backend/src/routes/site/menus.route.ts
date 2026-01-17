import { Router } from 'express';
import { getMenuByCode, getMenuById } from '../../controllers/site/menus.controller.js';

const r = Router();

// Get menu by ID (UUID format)
r.get('/id/:id', getMenuById);

// Get menu by code (string)
r.get('/:code', getMenuByCode);

export default r;
