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
  const { name, description, permissions } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nazwa jest wymagana' });
  }

  const role = await roleService.createRole({
    name,
    description,
    permissions,
  });

  return res.status(201).json({ role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  const role = await roleService.updateRole(id, {
    name,
    description,
    permissions,
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

export const addPermission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { permission } = req.body;

  if (!permission) {
    return res.status(400).json({ error: 'Uprawnienie jest wymagane' });
  }

  try {
    await roleService.addPermission(id, permission);
    const role = await roleService.findById(id);
    return res.status(200).json({ role });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
});

export const checkPermission = asyncHandler(async (req: Request, res: Response) => {
  const { id, permission } = req.params;

  const hasPermission = await roleService.hasPermission(id, permission);

  return res.status(200).json({ hasPermission });
});

export const removePermission = asyncHandler(async (req: Request, res: Response) => {
  const { id, permission } = req.params;

  try {
    await roleService.removePermission(id, permission);
    const role = await roleService.findById(id);
    return res.status(200).json({ role });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
});
