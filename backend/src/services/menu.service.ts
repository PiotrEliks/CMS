import { Op } from 'sequelize';
import { Menu, MenuItem, Content } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { ITreeService } from './types/ITreeService.js';

export class MenuService extends BaseService<Menu> implements ITreeService<MenuItem> {
  constructor() {
    super(Menu);
  }

  /**
   * Get menu as tree structure
   */
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

  /**
   * Add menu item under parent
   */
  async addItem(data: { label: string; url?: string; order_index?: number; menu_id: string; parent_id?: string | null; content_id?: string }, parentId?: string | null): Promise<any> {
    return await MenuItem.create({
      ...data,
      parent_id: parentId,
      order_index: data.order_index || 0,
      status: 'active',
    } as any);
  }

  /**
   * Update menu item
   */
  async updateItem(id: string, data: Partial<any>): Promise<any | null> {
    const item = await MenuItem.findByPk(id);
    if (!item) return null;

    return await item.update(data);
  }

  /**
   * Reorder menu items with parent changes
   */
  async reorder(items: Array<{ id: string; order_index: number; parent_id?: string | null }>): Promise<any[]> {
    // Check for cycles before applying changes
    for (const item of items) {
      if (item.parent_id) {
        const hasParentCycle = await this.hasCycle(item.id, item.parent_id);
        if (hasParentCycle) {
          throw new Error(`Cycle detected: cannot set ${item.parent_id} as parent of ${item.id}`);
        }
      }
    }

    // Apply all updates
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

  /**
   * Delete menu item and optionally cascade children
   */
  async deleteItem(id: string, cascadeChildren?: boolean): Promise<boolean> {
    const item = await MenuItem.findByPk(id);
    if (!item) return false;

    if (cascadeChildren) {
      // Delete all descendants
      await this.deleteDescendants(id);
    } else {
      // Move children up to parent
      await MenuItem.update({ parent_id: item.parent_id }, { where: { parent_id: id } });
    }

    await item.destroy();
    return true;
  }

  /**
   * Helper: Check if setting newParent as parent of itemId would create a cycle
   */
  private async hasCycle(itemId: string, potentialParentId: string): Promise<boolean> {
    let currentId: string | null = potentialParentId;

    // Walk up the parent chain
    while (currentId) {
      if (currentId === itemId) {
        return true; // Cycle detected
      }

      const item: any = await MenuItem.findByPk(currentId);
      currentId = item?.parent_id || null;
    }

    return false;
  }

  /**
   * Helper: Recursively delete all children of an item
   */
  private async deleteDescendants(parentId: string): Promise<void> {
    const children = await MenuItem.findAll({ where: { parent_id: parentId } });

    for (const child of children) {
      await this.deleteDescendants(child.menu_item_id);
      await child.destroy();
    }
  }

  /**
   * Get menu with items
   */
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

  /**
   * Update menu metadata
   */
  async updateMenu(menuId: string, data: { name?: string; description?: string }) {
    return await this.update(menuId, data as any);
  }
}

export const menuService = new MenuService();
