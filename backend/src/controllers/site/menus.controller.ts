import { Request, Response } from 'express';
import { menuService } from '../../services/menu.service.js';
import { buildMenuTree } from '../../utils/buildMenuTree.js';

export async function getMenuByCode(req: Request, res: Response) {
  const { code } = req.params;

  const result = await menuService.getPublishedByCode(code);

  if (!result) {
    return res.status(404).json({ error: 'Menu not found' });
  }

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ code: result.code, items: buildMenuTree(result.items) });
}
