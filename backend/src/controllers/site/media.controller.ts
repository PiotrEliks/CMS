import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { mediaService } from '../../services/media.service.js';
import { generatePdfThumbnail } from '../../utils/generatePdfThumbnail.js';

const FRONTEND_URL = process.env.FRONTEND_URL;

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: 'Brak pliku (field: file)' });
  }

  const folder = path.basename(path.dirname(file.path));
  const storage_path = `${folder}/${file.filename}`;
  const fullPath = file.path;    
  const mime_type = file.mimetype;
  console.log(storage_path);

  const url = FRONTEND_URL ? `${FRONTEND_URL}/uploads/${storage_path}` : null;

  let thumbnail_path: string | null = null;
  if (mime_type === 'application/pdf') {
    const thumbnailsDir = path.resolve(process.cwd(), 'uploads', 'thumbnails');
    await fs.mkdir(thumbnailsDir, { recursive: true });
    const thumbFilename = await generatePdfThumbnail(fullPath, thumbnailsDir);
    thumbnail_path = `thumbnails/${thumbFilename}`;
  }

  const media = await mediaService.createFromUpload({
    filename: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
    storage_path,
    url,
    thumbnail_path,
    alt_text: (req.body?.alt_text as string) ?? null,
    title: (req.body?.title as string) ?? null,
    uploaded_by: (req as any).user?.user_id ?? null,
  });

  return res.status(201).json({ media });
});

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await mediaService.getWithUsage(id);

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json(media);
});

export const getPublishedMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await mediaService.getPublishedById(id);

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  res.set('Cache-Control', 'public, max-age=300');
  return res.json(media);
});

export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const type = (req.query.type as 'image' | 'document' | undefined) ?? undefined;
  const used = (req.query.used as '1' | '0' | undefined) ?? undefined;
  const search = (req.query.search as string | undefined) ?? undefined;

  const { items, total } = await mediaService.listMedia({
    type,
    used,
    search,
    limit,
    offset,
  });

  return res.status(200).json({ items, total, limit, offset });
});

export const getMediaByType = asyncHandler(async (req: Request, res: Response) => {
  const { mimeType } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await mediaService.getByType(mimeType, { limit, offset });

  return res.json({ items, total, limit, offset });
});

export const getRecentMedia = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const items = await mediaService.getRecent(limit);

  return res.json({ items });
});

export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { alt_text, title, status } = req.body;

  const media = await mediaService.updateMetadata(id, {
    alt_text,
    title,
    status,
  });

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json({ media });
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await mediaService.deleteMedia(id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
});

export const getStorageStats = asyncHandler(async (_req: Request, res: Response) => {
  const totalBytes = await mediaService.getTotalStorageUsed();

  const totalMB = totalBytes / (1024 * 1024);
  const totalGB = totalMB / 1024;

  return res.json({
    total_bytes: totalBytes,
    total_mb: totalMB.toFixed(2),
    total_gb: totalGB.toFixed(2),
  });
});
