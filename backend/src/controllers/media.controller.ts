import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { mediaService } from '../services/media.service.js';

/**
 * Upload media file
 * POST /api/admin/media
 */
export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  // In a real app, you'd use multer and upload to cloud storage
  // This is a placeholder showing the expected interface
  const { filename, mime_type, file_size, url, alt_text } = req.body;

  if (!filename || !url) {
    return res.status(400).json({ error: 'Filename and URL are required' });
  }

  try {
    const media = await mediaService.createFromUpload({
      filename,
      mime_type,
      file_size,
      url,
      alt_text,
      uploaded_by: (req as any).user?.sub,
    });

    return res.status(201).json(media);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Get media by ID
 * GET /api/admin/media/:id
 */
export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await mediaService.getWithUsage(id);

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json(media);
});

/**
 * List media
 * GET /api/admin/media?limit=20&offset=0
 */
export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await mediaService.list({
    where: {},
    limit,
    offset,
    order: [['uploaded_at', 'DESC']],
  });

  return res.json({ items, total, limit, offset });
});

/**
 * Get media by type
 * GET /api/admin/media/type/:mimeType?limit=20&offset=0
 */
export const getMediaByType = asyncHandler(async (req: Request, res: Response) => {
  const { mimeType } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await mediaService.getByType(mimeType, { limit, offset });

  return res.json({ items, total, limit, offset });
});

/**
 * Get recent media
 * GET /api/admin/media/recent?limit=20
 */
export const getRecentMedia = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const items = await mediaService.getRecent(limit);

  return res.json({ items });
});

/**
 * Update media metadata
 * PUT /api/admin/media/:id
 */
export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { alt_text, filename } = req.body;

  const media = await mediaService.updateMetadata(id, {
    alt_text,
    filename,
  });

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json(media);
});

/**
 * Delete media
 * DELETE /api/admin/media/:id
 */
export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await mediaService.deleteMedia(id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
});

/**
 * Get storage statistics
 * GET /api/admin/media/stats/storage
 */
export const getStorageStats = asyncHandler(async (req: Request, res: Response) => {
  const totalBytes = await mediaService.getTotalStorageUsed();

  const totalMB = totalBytes / (1024 * 1024);
  const totalGB = totalMB / 1024;

  return res.json({
    total_bytes: totalBytes,
    total_mb: totalMB.toFixed(2),
    total_gb: totalGB.toFixed(2),
  });
});
