import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { roleService } from '../../services/role.service.js';
import { Role, Permission } from '../../models/index.js';

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
  const { display_name, permissions, status } = req.body;

  if (!display_name) {
    return res.status(400).json({ error: 'Nazwa jest wymagana' });
  }

  const role = await roleService.createRole({
    display_name,
    status,
  });

  if (Array.isArray(permissions)) {
    await roleService.setPermissions(role.role_id, permissions);
  }

  return res.status(201).json({ role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { display_name, type, status } = req.body;

  const role = await roleService.updateRole(id, {
    display_name,
    type,
    status,
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

export const getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await Role.findByPk(id, {
    include: [
      {
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
      },
    ],
  });

  if (!role) {
    return res.status(404).json({ error: 'Rola nie została znaleziona' });
  }

  const plain = role.toJSON() as any;

  return res.status(200).json({
    permissions: plain.permissions ?? [],
  });
});

export const updateRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { permissions } = req.body as { permissions?: string[] };

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({ error: 'Rola nie została znaleziona' });
  }

  const permissionIds = Array.isArray(permissions) ? permissions : [];

  const perms = await Permission.findAll({
    where: { permission_id: permissionIds as any },
  });

  // dzięki relacji many-to-many: Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions' })
  await (role as any).setPermissions(perms);

  const updatedWithPerms = await Role.findByPk(id, {
    include: [
      {
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
      },
    ],
  });

  const plain = updatedWithPerms?.toJSON() as any;

  return res.status(200).json({
    role: plain,
  });
});
