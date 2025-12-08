import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { categoryService } from '../services/category.service.js';

/**
 * Create category
 * POST /api/admin/categories
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, slug, order_index } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const category = await categoryService.create({
    name,
    description,
    slug,
    order_index,
  });

  return res.status(201).json(category);
});

/**
 * Get category by ID
 * GET /api/admin/categories/:id
 */
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await categoryService.findById(id);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json(category);
});

/**
 * Get category by slug
 * GET /api/sites/categories/:slug
 */
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await categoryService.getBySlug(slug);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json(category);
});

/**
 * List categories
 * GET /api/admin/categories?limit=20&offset=0
 */
export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await categoryService.list({
    where: {},
    limit,
    offset,
    order: [['order_index', 'ASC']],
  });

  return res.json({ items, total, limit, offset });
});

/**
 * List categories with content count
 * GET /api/admin/categories/with-counts
 */
export const listCategoriesWithCounts = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await categoryService.listWithCounts({
    where: {},
    limit,
    offset,
  });

  return res.json({ items, total, limit, offset });
});

/**
 * Update category
 * PUT /api/admin/categories/:id
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, slug, order_index } = req.body;

  const category = await categoryService.update(id, {
    name,
    description,
    slug,
    order_index,
  } as any);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json(category);
});

/**
 * Reorder categories
 * POST /api/admin/categories/reorder
 */
export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  await categoryService.reorder(items);

  return res.json({ ok: true });
});

/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await categoryService.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json({ ok: true });
});

/**
 * Generate slug from name
 * POST /api/admin/categories/generate-slug
 */
export const generateSlug = asyncHandler(async (req: Request, res: Response) => {
  const { name, existingId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const slug = await categoryService.generateSlug(name, existingId);

  return res.json({ slug });
});
