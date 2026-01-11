import { Request, Response } from 'express';
import { pageComponentService } from '../../services/pageComponent.service.js';
import { ComponentType, ComponentData } from '../../models/pageComponent.model.js';

export class PageComponentController {
  async getComponents(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const includeInactive = req.query.include_inactive === 'true';

      const components = await pageComponentService.getComponentsByContentId(
        contentId,
        includeInactive
      );

      res.json(components);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getComponent(req: Request, res: Response) {
    try {
      const { componentId } = req.params;
      const component = await pageComponentService.getComponentById(componentId);
      res.json(component);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createComponent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const { component_type, data, order_index, status } = req.body;

      if (!component_type || !data) {
        return res.status(400).json({ error: 'component_type and data are required' });
      }

      const component = await pageComponentService.createComponent({
        content_id: contentId,
        component_type: component_type as ComponentType,
        data: data as ComponentData,
        order_index,
        status,
      });

      res.status(201).json(component);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateComponent(req: Request, res: Response) {
    try {
      const { componentId } = req.params;
      const { data, order_index, status } = req.body;

      const component = await pageComponentService.updateComponent(componentId, {
        data: data as ComponentData,
        order_index,
        status,
      });

      res.json(component);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteComponent(req: Request, res: Response) {
    try {
      const { componentId } = req.params;
      const result = await pageComponentService.deleteComponent(componentId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async reorderComponents(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const { component_ids } = req.body;

      if (!Array.isArray(component_ids)) {
        return res.status(400).json({ error: 'component_ids must be an array' });
      }

      const components = await pageComponentService.reorderComponents(contentId, component_ids);
      res.json(components);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async duplicateComponent(req: Request, res: Response) {
    try {
      const { componentId } = req.params;
      const duplicate = await pageComponentService.duplicateComponent(componentId);
      res.status(201).json(duplicate);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { componentId } = req.params;
      const component = await pageComponentService.toggleComponentStatus(componentId);
      res.json(component);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getComponentsByType(req: Request, res: Response) {
    try {
      const { contentId, type } = req.params;
      const components = await pageComponentService.getComponentsByType(
        contentId,
        type as ComponentType
      );
      res.json(components);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async bulkCreateComponents(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const { components } = req.body;

      if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'components must be an array' });
      }

      const componentsWithContentId = components.map((c) => ({
        ...c,
        content_id: contentId,
      }));

      const created = await pageComponentService.bulkCreateComponents(componentsWithContentId);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAllComponents(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const result = await pageComponentService.deleteAllComponentsByContentId(contentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const pageComponentController = new PageComponentController();
