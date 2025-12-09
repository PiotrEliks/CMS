import { Role, User } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';

export class RoleService extends BaseService<Role> {
  constructor() {
    super(Role);
  }

  async createRole(data: {
    display_name: string;
    type: string;
  }) {
    return await super.create({
      display_name: data.display_name,
      type: data.type,
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

  async updateRole(roleId: string, data: { display_name?: string; type?: string }) {
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
}

export const roleService = new RoleService();
