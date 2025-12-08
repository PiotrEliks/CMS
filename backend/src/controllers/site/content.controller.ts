import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { contentService } from '../../services/content.service.js';
import { Category, User } from '../../models/index.js';

export const createContent = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, meta_description, meta_keywords, slug, status } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const content = await contentService.create({
    title,
    body,
    meta_description,
    meta_keywords,
    slug,
    status,
    created_by: (req as any).user?.sub,
  });

  return res.status(201).json(content);
});

export const getContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const content = await contentService.findById(id);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json(content);
});


export const getContentBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const content = await contentService.getBySlug(slug);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json(content);
});


export const listContents = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await contentService.list({
    where: {},
    limit,
    offset,
    include: [
      { model: Category, as: 'categories' },
      { model: User, as: 'creator', attributes: ['user_id', 'display_name'] },
    ],
  });

  return res.json({ items, total, limit, offset });
});

export const listPublishedContents = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await contentService.getPublished({
    where: {},
    limit,
    offset,
  });

  return res.json({ items, total, limit, offset });
});


export const updateContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, body, meta_description, meta_keywords, slug, status } = req.body;

  const content = await contentService.update(id, {
    title,
    body,
    meta_description,
    meta_keywords,
    slug,
    status,
    updated_by: (req as any).user?.sub,
  } as any);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json(content);
});

export const publishContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const content = await contentService.publish(id);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json(content);
});

export const unpublishContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const content = await contentService.unpublish(id);

  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json(content);
});

export const attachCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id, categoryId } = req.params;

  try {
    await contentService.attachCategory(id, categoryId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

export const detachCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id, categoryId } = req.params;

  try {
    await contentService.detachCategory(id, categoryId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

export const attachMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id, mediaId } = req.params;

  try {
    await contentService.attachMedia(id, mediaId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});


export const detachMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id, mediaId } = req.params;

  try {
    await contentService.detachMedia(id, mediaId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

export const deleteContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await contentService.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Content not found' });
  }

  return res.json({ ok: true });
});


export const generateSlug = asyncHandler(async (req: Request, res: Response) => {
  const { title, existingId } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const slug = await contentService.generateSlug(title, existingId);

  return res.json({ slug });
});
