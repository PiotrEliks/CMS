import { Menu } from '../models/menu.model.js';
import { MenuItem } from '../models/menuItem.model.js';
import { Content } from '../models/content.model.js';
import { Op } from 'sequelize';

export class MenuService {
  async getAllMenus(filters?: { status?: boolean; search?: string }) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { code: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return await Menu.findAll({
      where,
      order: [['name', 'ASC']],
    });
  }

  async getMenuById(menuId: string) {
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }
    return menu;
  }

  async getMenuByCode(code: string) {
    const menu = await Menu.findOne({ where: { code } });
    if (!menu) {
      throw new Error('Menu not found');
    }
    return menu;
  }

  async createMenu(data: { code: string; name: string; status?: boolean }) {
    const existing = await Menu.findOne({ where: { code: data.code } });
    if (existing) {
      throw new Error('Menu with this code already exists');
    }

    return await Menu.create(data);
  }

  async updateMenu(menuId: string, updates: { code?: string; name?: string; status?: boolean }) {
    const menu = await this.getMenuById(menuId);

    if (updates.code && updates.code !== menu.code) {
      const existing = await Menu.findOne({ where: { code: updates.code } });
      if (existing) {
        throw new Error('Menu with this code already exists');
      }
    }

    await menu.update(updates);
    return menu;
  }

  async deleteMenu(menuId: string) {
    const menu = await this.getMenuById(menuId);
    await menu.destroy();
    return { deleted: true, menu_id: menuId };
  }

  async getMenuWithItems(menuId: string, includeInactive = false) {
    const menu = await Menu.findByPk(menuId, {
      include: [
        {
          model: MenuItem,
          as: 'items',
          where: includeInactive ? undefined : { status: true },
          required: false,
          include: [
            {
              model: Content,
              as: 'content',
              attributes: ['content_id', 'title', 'slug'],
            },
            {
              model: MenuItem,
              as: 'children',
              required: false,
              include: [
                {
                  model: Content,
                  as: 'content',
                  attributes: ['content_id', 'title', 'slug'],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: MenuItem, as: 'items' }, 'order_index', 'ASC']],
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    return menu;
  }

  async getMenuByCodeWithItems(code: string, includeInactive = false) {
    const menu = await Menu.findOne({
      where: { code },
      include: [
        {
          model: MenuItem,
          as: 'items',
          where: includeInactive ? undefined : { status: true, parent_id: null },
          required: false,
          include: [
            {
              model: Content,
              as: 'content',
              attributes: ['content_id', 'title', 'slug'],
            },
            {
              model: MenuItem,
              as: 'children',
              where: includeInactive ? undefined : { status: true },
              required: false,
              include: [
                {
                  model: Content,
                  as: 'content',
                  attributes: ['content_id', 'title', 'slug'],
                },
                {
                  model: MenuItem,
                  as: 'children',
                  where: includeInactive ? undefined : { status: true },
                  required: false,
                  include: [
                    {
                      model: Content,
                      as: 'content',
                      attributes: ['content_id', 'title', 'slug'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: MenuItem, as: 'items' }, 'order_index', 'ASC'],
        [
          { model: MenuItem, as: 'items' },
          { model: MenuItem, as: 'children' },
          'order_index',
          'ASC',
        ],
      ],
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    return menu;
  }

  async createMenuItem(data: {
    menu_id: string;
    label: string;
    content_id?: string;
    parent_id?: string;
    order_index?: number;
    status?: boolean;
  }) {
    await this.getMenuById(data.menu_id);

    if (data.parent_id) {
      const parent = await MenuItem.findByPk(data.parent_id);
      if (!parent) {
        throw new Error('Parent menu item not found');
      }
    }

    if (data.content_id) {
      const content = await Content.findByPk(data.content_id);
      if (!content) {
        throw new Error('Content not found');
      }
    }

    if (data.order_index === undefined) {
      const lastItem = await MenuItem.findOne({
        where: {
          menu_id: data.menu_id,
          parent_id: data.parent_id || null,
        },
        order: [['order_index', 'DESC']],
      });
      data.order_index = lastItem ? lastItem.order_index + 1 : 0;
    }

    return await MenuItem.create(data);
  }

  async updateMenuItem(
    menuItemId: string,
    updates: {
      label?: string;
      content_id?: string;
      parent_id?: string;
      order_index?: number;
      status?: boolean;
    }
  ) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    if (updates.content_id) {
      const content = await Content.findByPk(updates.content_id);
      if (!content) {
        throw new Error('Content not found');
      }
    }

    if (updates.parent_id) {
      if (updates.parent_id === menuItemId) {
        throw new Error('Menu item cannot be its own parent');
      }
      const parent = await MenuItem.findByPk(updates.parent_id);
      if (!parent) {
        throw new Error('Parent menu item not found');
      }
    }

    await menuItem.update(updates);
    return menuItem;
  }

  async deleteMenuItem(menuItemId: string) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    await menuItem.destroy();
    return { deleted: true, menu_item_id: menuItemId };
  }

  async reorderMenuItems(menuId: string, itemIds: string[]) {
    const items = await MenuItem.findAll({
      where: {
        menu_id: menuId,
        menu_item_id: { [Op.in]: itemIds },
      },
    });

    if (items.length !== itemIds.length) {
      throw new Error('Some menu items not found');
    }

    const updates = itemIds.map((id, index) =>
      MenuItem.update({ order_index: index }, { where: { menu_item_id: id } })
    );

    await Promise.all(updates);

    return await this.getMenuWithItems(menuId);
  }

  async duplicateMenuItem(menuItemId: string) {
    const original = await MenuItem.findByPk(menuItemId);
    if (!original) {
      throw new Error('Menu item not found');
    }

    const duplicate = await MenuItem.create({
      menu_id: original.menu_id,
      label: `${original.label} (copy)`,
      content_id: original.content_id,
      parent_id: original.parent_id,
      order_index: original.order_index + 1,
      status: original.status,
    });

    await MenuItem.update(
      { order_index: MenuItem.sequelize!.literal('order_index + 1') },
      {
        where: {
          menu_id: original.menu_id,
          parent_id: original.parent_id || null,
          order_index: { [Op.gt]: original.order_index },
          menu_item_id: { [Op.ne]: duplicate.menu_item_id },
        },
      }
    );

    return duplicate;
  }

  async toggleMenuItemStatus(menuItemId: string) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    await menuItem.update({ status: !menuItem.status });
    return menuItem;
  }
}

export const menuService = new MenuService();
