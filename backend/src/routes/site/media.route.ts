import { Router } from 'express';
import { getMedia } from '../../controllers/site/media.controller.js';

const r = Router();
r.get('/:id', getMedia);

export default r;
