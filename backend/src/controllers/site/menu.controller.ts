import { Request, Response } from 'express';
import { menuService } from '../../services/menu.service.js';

export class MenuController {
  async getMenus(req: Request, res: Response) {
    try {
      const { status, search } = req.query;

      const menus = await menuService.getAllMenus({
        status: status === 'true' ? true : status === 'false' ? false : undefined,
        search: search as string,
      });

      res.json({ items: menus, total: menus.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menu = await menuService.getMenuById(id);
      res.json(menu);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getMenuByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const menu = await menuService.getMenuByCode(code);
      res.json(menu);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createMenu(req: Request, res: Response) {
    try {
      const { code, name, status } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: 'code and name are required' });
      }

      const menu = await menuService.createMenu({ code, name, status });
      res.status(201).json(menu);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, name, status } = req.body;

      const menu = await menuService.updateMenu(id, { code, name, status });
      res.json(menu);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMenu(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await menuService.deleteMenu(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getMenuWithItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.include_inactive === 'true';

      const menu = await menuService.getMenuWithItems(id, includeInactive);
      res.json(menu);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getMenuByCodeWithItems(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const includeInactive = req.query.include_inactive === 'true';

      const menu = await menuService.getMenuByCodeWithItems(code, includeInactive);
      res.json(menu);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createMenuItem(req: Request, res: Response) {
    try {
      const { menuId } = req.params;
      const { label, content_id, parent_id, order_index, status } = req.body;

      if (!label) {
        return res.status(400).json({ error: 'label is required' });
      }

      const menuItem = await menuService.createMenuItem({
        menu_id: menuId,
        label,
        content_id,
        parent_id,
        order_index,
        status,
      });

      res.status(201).json(menuItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { label, content_id, parent_id, order_index, status } = req.body;

      const menuItem = await menuService.updateMenuItem(id, {
        label,
        content_id,
        parent_id,
        order_index,
        status,
      });

      res.json(menuItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await menuService.deleteMenuItem(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async reorderMenuItems(req: Request, res: Response) {
    try {
      const { menuId } = req.params;
      const { item_ids } = req.body;

      if (!Array.isArray(item_ids)) {
        return res.status(400).json({ error: 'item_ids must be an array' });
      }

      const menu = await menuService.reorderMenuItems(menuId, item_ids);
      res.json(menu);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async duplicateMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const duplicate = await menuService.duplicateMenuItem(id);
      res.status(201).json(duplicate);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async toggleMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menuItem = await menuService.toggleMenuItemStatus(id);
      res.json(menuItem);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

export const menuController = new MenuController();
