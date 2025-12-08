import { Role, User } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';

export class RoleService extends BaseService<Role> {
  constructor() {
    super(Role);
  }

  /**
   * Create role with permissions array
   */
  async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }) {
    return await super.create({
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
    } as any);
  }

  /**
   * Get role with users who have it
   */
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

  /**
   * Update role
   */
  async updateRole(roleId: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return await this.update(roleId, data as any);
  }

  /**
   * Add permission to role
   */
  async addPermission(roleId: string, permission: string): Promise<void> {
    const role = await this.findById(roleId);
    if (!role) throw new Error('Role not found');

    const permissions = (role as any).permissions || [];
    if (!permissions.includes(permission)) {
      permissions.push(permission);
      await this.update(roleId, { permissions } as any);
    }
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: string, permission: string): Promise<void> {
    const role = await this.findById(roleId);
    if (!role) throw new Error('Role not found');

    const permissions = (role as any).permissions || [];
    const filtered = permissions.filter((p: string) => p !== permission);

    if (filtered.length !== permissions.length) {
      await this.update(roleId, { permissions: filtered } as any);
    }
  }

  /**
   * Check if role has permission
   */
  async hasPermission(roleId: string, permission: string): Promise<boolean> {
    const role = await this.findById(roleId);
    if (!role) return false;

    const permissions = (role as any).permissions || [];
    return permissions.includes(permission);
  }

  /**
   * Get all roles sorted by name
   */
  async listRoles(options: PaginationOptions & FindOptions) {
    return await this.list({
      ...options,
      order: [['name', 'ASC']],
    });
  }

  /**
   * Delete role and unassign from users
   */
  async deleteRole(roleId: string): Promise<void> {
    // Remove role from all users
    await User.update({ role_id: null }, { where: { role_id: roleId } });

    // Delete role
    await this.delete(roleId);
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string) {
    return await this.findOne({ where: { name } as any });
  }
}

export const roleService = new RoleService();
