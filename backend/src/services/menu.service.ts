import { Op } from 'sequelize';
import { Menu, MenuItem, Content } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { ITreeService } from './types/ITreeService.js';

export class MenuService extends BaseService<Menu> implements ITreeService<MenuItem> {
  constructor() {
    super(Menu);
  }

  async getTree(): Promise<any[]> {
    const items = await MenuItem.findAll({
      where: { parent_id: null },
      include: [
        {
          model: MenuItem,
          as: 'children',
          include: [{ model: Content, as: 'content' }],
        },
        { model: Content, as: 'content' },
      ],
      order: [['order_index', 'ASC']],
    });

    return items;
  }


  async addItem(data: { label: string; url?: string; order_index?: number; menu_id: string; parent_id?: string | null; content_id?: string }, parentId?: string | null): Promise<any> {
    return await MenuItem.create({
      ...data,
      parent_id: parentId,
      order_index: data.order_index || 0,
      status: 'active',
    } as any);
  }


  async updateItem(id: string, data: Partial<any>): Promise<any | null> {
    const item = await MenuItem.findByPk(id);
    if (!item) return null;

    return await item.update(data);
  }

  async reorder(items: Array<{ id: string; order_index: number; parent_id?: string | null }>): Promise<any[]> {
    for (const item of items) {
      if (item.parent_id) {
        const hasParentCycle = await this.hasCycle(item.id, item.parent_id);
        if (hasParentCycle) {
          throw new Error(`Cycle detected: cannot set ${item.parent_id} as parent of ${item.id}`);
        }
      }
    }

    const updated = await Promise.all(
      items.map((item) =>
        MenuItem.update(
          { order_index: item.order_index, parent_id: item.parent_id },
          { where: { menu_item_id: item.id } }
        )
      )
    );

    // Return updated items
    return await Promise.all(items.map((item) => MenuItem.findByPk(item.id)));
  }


  async deleteItem(id: string, cascadeChildren?: boolean): Promise<boolean> {
    const item = await MenuItem.findByPk(id);
    if (!item) return false;

    if (cascadeChildren) {
      await this.deleteDescendants(id);
    } else {
      await MenuItem.update({ parent_id: item.parent_id }, { where: { parent_id: id } });
    }

    await item.destroy();
    return true;
  }


  private async hasCycle(itemId: string, potentialParentId: string): Promise<boolean> {
    let currentId: string | null = potentialParentId;
    while (currentId) {
      if (currentId === itemId) {
        return true; 
      }

      const item: any = await MenuItem.findByPk(currentId);
      currentId = item?.parent_id || null;
    }

    return false;
  }

  private async deleteDescendants(parentId: string): Promise<void> {
    const children = await MenuItem.findAll({ where: { parent_id: parentId } });

    for (const child of children) {
      await this.deleteDescendants(child.menu_item_id);
      await child.destroy();
    }
  }


  async getMenuWithItems(menuId: string) {
    return await this.findOne({
      where: { menu_id: menuId },
      include: [
        {
          model: MenuItem,
          as: 'items',
          include: [
            { model: MenuItem, as: 'children' },
            { model: Content, as: 'content' },
          ],
        },
      ],
    });
  }

  async updateMenu(menuId: string, data: { name?: string; description?: string }) {
    return await this.update(menuId, data as any);
  }

  async getPublishedByCode(code: string) {
    const menu = await Menu.findOne({ where: { code, status: true } });
    if (!menu) return null;

    // Get published items with content
    const items = await MenuItem.findAll({
      where: { menu_id: (menu as any).menu_id, status: true },
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

    return { code: (menu as any).code, items: flat };
  }
}

export const menuService = new MenuService();
