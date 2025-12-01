import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Content } from '../../models/index.js';

export async function getHome(_req: Request, res: Response) {
  // przykładowo: featured po typie/znaczniku albo po dacie
  const latest = await Content.findAll({
    where: { status: true, published_at: { [Op.lte]: new Date() } },
    order: [['published_at', 'DESC']],
    limit: 6,
    attributes: ['content_id', 'slug', 'title', 'lead', 'published_at'],
  });

  // jeśli masz flagę featured w key_value albo content.meta → pobierz inaczej
  const featured = latest.slice(0, 3);

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ featured, latest });
}
