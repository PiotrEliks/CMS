import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { roleService } from '../../services/role.service.js';

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await roleService.listRoles({
    where: {},
    limit,
    offset,
  });

  return res.status(200).json({ roles: items, total });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await roleService.getRoleWithUsers(id);

  if (!role) {
    return res.status(404).json({ error: 'Rola nie została znaleziona' });
  }

  return res.status(200).json({ role });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { display_name, type } = req.body;

  if (!display_name) {
    return res.status(400).json({ error: 'Nazwa jest wymagana' });
  }

  const role = await roleService.createRole({
    display_name,
    type,
  });

  return res.status(201).json({ role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { display_name, type } = req.body;

  const role = await roleService.updateRole(id, {
    display_name,
    type,
  });

  if (!role) {
    return res.status(404).json({ error: 'Rola nie została znaleziona' });
  }

  return res.status(200).json({ role });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await roleService.findById(id);
  if (!role) {
    return res.status(404).json({ error: 'Rola nie została znaleziona' });
  }

  await roleService.deleteRole(id);

  return res.status(200).json({ success: true });
});
