import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Category, Content, ContentCategory } from '../../models/index.js';

export async function getCategory(req: Request, res: Response) {
  const { slug } = req.params;

  const category = await Category.findOne({
    where: { slug, status: true },
    attributes: ['category_id', 'display_name', 'slug', 'path'],
  });
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const contentLinks = await ContentCategory.findAll({
    where: { category_category_id: category.category_id },
    attributes: ['content_content_id'],
  });
  const ids = contentLinks.map((x: any) => x.content_content_id);
  if (ids.length === 0)
    return res.json({ category, items: [] });

  const items = await Content.findAll({
    where: {
      content_id: { [Op.in]: ids },
      status: true,
      published_at: { [Op.lte]: new Date() },
    },
    order: [['published_at', 'DESC']],
    attributes: ['content_id', 'slug', 'title', 'lead', 'published_at'],
  });

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ category, items });
}
