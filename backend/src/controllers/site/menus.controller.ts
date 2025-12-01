import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Menu, MenuItem, Content } from '../../models/index.js'; // dostosuj ścieżkę
import { buildMenuTree } from '../../utils/buildMenuTree.js';

export async function getMenuByCode(req: Request, res: Response) {
  const { code } = req.params;

  const menu = await Menu.findOne({ where: { code, status: true } });
  if (!menu) return res.status(404).json({ error: 'Menu not found' });

  // Pobierz items + opcjonalnie powiązany content (po slug)
  const items = await MenuItem.findAll({
    where: { menu_id: menu.menu_id, status: true },
    order: [['order_index', 'ASC']],
    include: [
      {
        model: Content,
        as: 'content',
        required: false,
        where: {
          status: true,
          published_at: { [Op.lte]: new Date() },
        },
        attributes: ['slug'],
      },
    ],
  });

  const flat = items.map((i: any) => ({
    menu_item_id: i.menu_item_id,
    label: i.label,
    order_index: i.order_index ?? 0,
    parent_id: i.parent_id ?? null,
    content_slug: i.content?.slug ?? null,
    external_url: i.external_url ?? null,
  }));

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ code: menu.code, items: buildMenuTree(flat) });
}
