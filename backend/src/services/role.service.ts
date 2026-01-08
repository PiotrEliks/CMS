import { Role, User, Permission, RolePermission } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';

function normalizeRoleType(displayName: string): string {
  return displayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

export class RoleService extends BaseService<Role> {
  constructor() {
    super(Role);
  }

  async createRole(data: { display_name: string; status: boolean }) {
    return await super.create({
      display_name: data.display_name,
      type: normalizeRoleType(data.display_name),
      status: data.status,
    } as any);
  }

  async getRoleWithUsers(roleId: string) {
    return await this.findOne({
      where: { role_id: roleId },
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'email', 'display_name'],
        },
      ],
    });
  }

  async updateRole(
    roleId: string,
    data: { display_name?: string; type?: string; status: boolean }
  ) {
    return await this.update(roleId, data as any);
  }

  async listRoles(options: PaginationOptions & FindOptions) {
    return await this.list({
      ...options,
      order: [['display_name', 'ASC']],
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    await User.update({ role_id: null }, { where: { role_id: roleId } });
    await this.delete(roleId);
  }

  async getRoleByType(type: string) {
    return await this.findOne({ where: { type } as any });
  }

  async setPermissions(roleId: string, permissionCodes: string[]) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Rola nie istnieje');

    const perms = await Permission.findAll({
      where: { code: permissionCodes },
    });

    await (role as any).setPermissions(perms);
    return role.reload({ include: ['permissions'] });
  }

  async addPermission(roleId: string, permissionCode: string) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Rola nie istnieje');

    const perm = await Permission.findOne({ where: { code: permissionCode } });
    if (!perm) throw new Error('Uprawnienie nie istnieje');

    await (role as any).addPermission(perm);
    return role.reload({ include: ['permissions'] });
  }

  async removePermission(roleId: string, permissionCode: string) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Rola nie istnieje');

    const perm = await Permission.findOne({ where: { code: permissionCode } });
    if (!perm) return role;

    await (role as any).removePermission(perm);
    return role.reload({ include: ['permissions'] });
  }

  async getPermissions(roleId: string) {
    const role = await this.findOne({
      where: { role_id: roleId },
      include: [{ model: Permission, as: 'permissions' }],
    });

    return role?.permissions ?? [];
  }
}

export const roleService = new RoleService();
