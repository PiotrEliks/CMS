import { Request, Response } from 'express';
import { mediaService } from '../../services/media.service.js';

export async function getMedia(req: Request, res: Response) {
  const { id } = req.params;

  const media = await mediaService.getPublishedById(id);

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  res.set('Cache-Control', 'public, max-age=300');
  return res.json(media);
}
