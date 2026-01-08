import { Request, Response } from 'express';
import { contentSectionService } from '../../services/contentSection.service.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getSections = asyncHandler(async (req: Request, res: Response) => {
  const { contentId } = req.params;

  try {
    const sections = await contentSectionService.getSectionsByContentId(contentId);
    return res.json({ sections });
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    return res.status(500).json({
      error: 'Failed to fetch sections',
      message: error.message,
    });
  }
});

export const getSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;

  try {
    const section = await contentSectionService.getSectionById(sectionId);
    return res.json({ section });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const { contentId } = req.params;
  const { section_type, heading, subheading, body, media_ids, settings, order_index } = req.body;

  if (!section_type) {
    return res.status(400).json({ error: 'section_type is required' });
  }

  const validTypes = ['text', 'image', 'gallery', 'pdf', 'video', 'html', 'embed'];
  if (!validTypes.includes(section_type)) {
    return res.status(400).json({
      error: 'Invalid section_type',
      validTypes,
    });
  }

  try {
    const section = await contentSectionService.createSection({
      content_id: contentId,
      section_type,
      heading: heading || '',
      subheading: subheading || '',
      body: body || '',
      media_ids: media_ids || [],
      settings: settings || {},
      order_index,
    });

    return res.status(201).json({ section });
  } catch (error: any) {
    console.error('Error creating section:', error);
    return res.status(400).json({
      error: 'Failed to create section',
      message: error.message,
    });
  }
});

export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { section_type, heading, subheading, body, media_ids, settings, status, order_index } =
    req.body;

  try {
    const section = await contentSectionService.updateSection(sectionId, {
      section_type,
      heading,
      subheading,
      body,
      media_ids,
      settings,
      status,
      order_index,
    });

    return res.json({ section });
  } catch (error: any) {
    console.error('Error updating section:', error);
    return res.status(404).json({
      error: 'Failed to update section',
      message: error.message,
    });
  }
});

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;

  try {
    await contentSectionService.deleteSection(sectionId);
    return res.json({ ok: true, message: 'Section deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    return res.status(404).json({
      error: 'Failed to delete section',
      message: error.message,
    });
  }
});

export const reorderSections = asyncHandler(async (req: Request, res: Response) => {
  const { contentId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items array is required' });
  }

  for (const item of items) {
    if (!item.section_id || typeof item.order_index !== 'number') {
      return res.status(400).json({
        error: 'Each item must have section_id and order_index',
      });
    }
  }

  try {
    const sections = await contentSectionService.reorderSections(contentId, items);
    return res.json({ sections });
  } catch (error: any) {
    console.error('Error reordering sections:', error);
    return res.status(400).json({
      error: 'Failed to reorder sections',
      message: error.message,
    });
  }
});

export const duplicateSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;

  try {
    const section = await contentSectionService.duplicateSection(sectionId);
    return res.status(201).json({ section });
  } catch (error: any) {
    console.error('Error duplicating section:', error);
    return res.status(404).json({
      error: 'Failed to duplicate section',
      message: error.message,
    });
  }
});
