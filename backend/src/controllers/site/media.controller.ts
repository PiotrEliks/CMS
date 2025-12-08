import { Request, Response } from 'express';
import { Media } from '../../models/index.js';

export async function getMedia(req: Request, res: Response) {
  const { id } = req.params;
  const media = await Media.findOne({
    where: { media_id: id, status: true },
    attributes: ['media_id', 'storage_path', 'mime_type', 'width', 'height', 'alt_text', 'title'],
  });
  if (!media) return res.status(404).json({ error: 'Media not found' });

  res.set('Cache-Control', 'public, max-age=300');
  return res.json(media);
}
