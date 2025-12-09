import { Request, Response } from 'express';
import { categoryService } from '../../services/category.service.js';

export async function getCategory(req: Request, res: Response) {
  const { slug } = req.params;

  const result = await categoryService.getPublishedBySlug(slug);

  if (!result) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.set('Cache-Control', 'public, max-age=60');
  return res.json(result);
}
