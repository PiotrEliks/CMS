import { PageComponent, ComponentType, ComponentData } from '../models/pageComponent.model.js';
import { Op } from 'sequelize';

export interface DisplayOrderItem {
  component_id: string;
  display_order: number;
}

export class PageComponentService {
  async getComponentsByContentId(contentId: string, includeInactive = false) {
    const where: any = { content_id: contentId };
    if (!includeInactive) {
      where.status = true;
    }

    return await PageComponent.findAll({
      where,
      order: [
        ['display_order', 'ASC'],
        ['order_index', 'ASC'],
      ],
    });
  }

  async getComponentById(componentId: string) {
    const component = await PageComponent.findByPk(componentId);
    if (!component) {
      throw new Error('Component not found');
    }
    return component;
  }

  async createComponent(data: {
    content_id: string;
    component_type: ComponentType;
    data: ComponentData;
    order_index?: number;
    display_order?: number;
    status?: boolean;
  }) {
    if (data.order_index === undefined) {
      const lastComponent = await PageComponent.findOne({
        where: { content_id: data.content_id },
        order: [['order_index', 'DESC']],
      });
      data.order_index = lastComponent ? lastComponent.order_index + 1 : 0;
    }

    if (data.display_order === undefined) {
      const lastDisplay = await PageComponent.findOne({
        where: { content_id: data.content_id },
        order: [['display_order', 'DESC']],
      });
      data.display_order =
        lastDisplay && lastDisplay.display_order !== null ? lastDisplay.display_order + 1 : 0;
    }

    return await PageComponent.create(data);
  }

  async updateComponent(
    componentId: string,
    updates: {
      data?: ComponentData;
      order_index?: number;
      display_order?: number;
      status?: boolean;
    }
  ) {
    const component = await this.getComponentById(componentId);
    await component.update(updates);
    return component;
  }

  async deleteComponent(componentId: string) {
    const component = await this.getComponentById(componentId);

    const contentId = component.content_id;
    const deletedDisplay = component.display_order;

    await component.destroy();

    if (deletedDisplay !== null && deletedDisplay !== undefined) {
      await PageComponent.update(
        { display_order: PageComponent.sequelize!.literal('display_order - 1') },
        {
          where: {
            content_id: contentId,
            display_order: { [Op.gt]: deletedDisplay },
          },
        }
      );
    }

    return { deleted: true, component_id: componentId };
  }

  async reorderComponents(contentId: string, componentIds: string[]) {
    const components = await PageComponent.findAll({
      where: {
        content_id: contentId,
        component_id: { [Op.in]: componentIds },
      },
    });

    if (components.length !== componentIds.length) {
      throw new Error('Some components not found');
    }

    const updates = componentIds.map((id, index) =>
      PageComponent.update({ order_index: index }, { where: { component_id: id } })
    );

    await Promise.all(updates);

    return await this.getComponentsByContentId(contentId);
  }

  async reorderDisplayOrder(contentId: string, items: DisplayOrderItem[]) {
    const componentIds = items.map((item) => item.component_id);
    const components = await PageComponent.findAll({
      where: {
        content_id: contentId,
        component_id: { [Op.in]: componentIds },
      },
    });

    if (components.length !== items.length) {
      throw new Error('Some components do not belong to this content');
    }

    const updates = items.map((item) =>
      PageComponent.update(
        { display_order: item.display_order },
        { where: { component_id: item.component_id } }
      )
    );

    await Promise.all(updates);

    return await this.getComponentsByContentId(contentId);
  }

  async duplicateComponent(componentId: string) {
    const original = await this.getComponentById(componentId);

    const lastDisplay = await PageComponent.findOne({
      where: { content_id: original.content_id },
      order: [['display_order', 'DESC']],
    });

    const duplicate = await PageComponent.create({
      content_id: original.content_id,
      component_type: original.component_type,
      data: original.data,
      order_index: original.order_index + 1,
      display_order:
        lastDisplay && lastDisplay.display_order !== null ? lastDisplay.display_order + 1 : 0,
      status: original.status,
    });

    await PageComponent.update(
      { order_index: PageComponent.sequelize!.literal('order_index + 1') },
      {
        where: {
          content_id: original.content_id,
          order_index: { [Op.gt]: original.order_index },
          component_id: { [Op.ne]: duplicate.component_id },
        },
      }
    );

    return duplicate;
  }

  async toggleComponentStatus(componentId: string) {
    const component = await this.getComponentById(componentId);
    await component.update({ status: !component.status });
    return component;
  }

  async getComponentsByType(contentId: string, componentType: ComponentType) {
    return await PageComponent.findAll({
      where: {
        content_id: contentId,
        component_type: componentType,
      },
      order: [
        ['display_order', 'ASC'],
        ['order_index', 'ASC'],
      ],
    });
  }

  async bulkCreateComponents(
    components: Array<{
      content_id: string;
      component_type: ComponentType;
      data: ComponentData;
      order_index?: number;
      display_order?: number;
      status?: boolean;
    }>
  ) {
    return await PageComponent.bulkCreate(components);
  }

  async deleteAllComponentsByContentId(contentId: string) {
    await PageComponent.destroy({
      where: { content_id: contentId },
    });
    return { deleted: true, content_id: contentId };
  }
}

export const pageComponentService = new PageComponentService();
