import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { User, Role } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';
import { generateRandomPassword, hashPassword } from '../utils/password.js';
import { sendNewUserCredentialsMail } from '../utils/mailer.js';

async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  async getUserWithRole(userId: string) {
    return await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role' }],
    });
  }

  async getUserByEmail(email: string) {
    return await this.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Role, as: 'role' }],
    });
  }

  async listWithRoles(options: PaginationOptions & FindOptions) {
    const { limit, offset, ...rest } = options;

    const { rows, count } = await User.findAndCountAll({
      ...rest,
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role' }],
      limit,
      offset,
      distinct: true,
    });

    return { items: rows, total: count };
  }

  /**
   * Search users by email or name
   */
  async search(query: string, options: PaginationOptions) {
    const { rows, count } = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { display_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role' }],
      limit: options.limit,
      offset: options.offset,
      distinct: true,
    });

    return { items: rows, total: count };
  }

  async createWithEmail(data: {
    email: string;
    display_name?: string;
    role_id?: string;
    status?: boolean;
  }) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      throw new Error('Użytkownik o podanym adresie email już istnieje');
    }

    const plainPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(plainPassword);

    const user = await User.create({
      email: data.email,
      display_name: data.display_name,
      role_id: data.role_id,
      status: data.status !== false,
      password_hash,
    } as any);

    // Send email (non-blocking)
    sendNewUserCredentialsMail({
      to: data.email,
      password: plainPassword,
    }).catch((err) => console.error('Nie udało się wysłać maila z danymi logowania:', err));

    return await this.getUserWithRole((user as any).user_id);
  }

  async updateUserData(
    userId: string,
    data: {
      email?: string;
      display_name?: string;
      role_id?: string;
      status?: boolean;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    if (data.email && data.email !== (user as any).email) {
      const existing = await User.findOne({ where: { email: data.email } });
      if (existing && (existing as any).user_id !== (user as any).user_id) {
        throw new Error('Użytkownik o podanym adresie email już istnieje');
      }
    }

    await user.update({
      email: data.email ?? (user as any).email,
      display_name: data.display_name ?? (user as any).display_name,
      role_id: data.role_id ?? (user as any).role_id,
      ...(typeof data.status === 'boolean' ? { status: data.status } : {}),
    });

    return await this.getUserWithRole(userId);
  }

  async updateCurrentUserProfile(
    userId: string,
    data: {
      display_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    const updatePayload: any = {};

    if (data.display_name !== undefined) {
      updatePayload.display_name = data.display_name;
    }

    if (data.email !== undefined && data.email !== (user as any).email) {
      const normalizedEmail = data.email.toLowerCase();
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (existing && (existing as any).user_id !== (user as any).user_id) {
        throw new Error('Użytkownik o podanym adresie email już istnieje');
      }
      updatePayload.email = normalizedEmail;
    }

    // Password change logic
    if (data.current_password || data.new_password) {
      if (!data.current_password || !data.new_password) {
        throw new Error('Aby zmienić hasło, podaj zarówno aktualne, jak i nowe hasło.');
      }

      const ok = await bcrypt.compare(data.current_password, (user as any).password_hash);
      if (!ok) {
        throw new Error('Aktualne hasło jest nieprawidłowe.');
      }

      if (data.new_password.length < 8) {
        throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
      }

      const hashed = await bcrypt.hash(data.new_password, 10);
      updatePayload.password_hash = hashed;
    }

    if (Object.keys(updatePayload).length > 0) {
      await user.update(updatePayload);
    }

    return await this.getUserWithRole(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new Error('Aby zmienić hasło, podaj zarówno aktualne, jak i nowe hasło.');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    const isValid = await comparePassword(currentPassword, (user as any).password_hash);
    if (!isValid) {
      throw new Error('Aktualne hasło jest nieprawidłowe.');
    }

    if (newPassword.length < 8) {
      throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
    }

    const password_hash = await hashPassword(newPassword);
    await user.update({ password_hash });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    if (newPassword.length < 8) {
      throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
    }

    const password_hash = await hashPassword(newPassword);
    await user.update({ password_hash });
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) return false;

    return comparePassword(password, (user as any).password_hash);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('Rola nie została znaleziona');
    }

    await user.update({ role_id: roleId });
  }

  async removeRole(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    await user.update({ role_id: null });
  }

  async activate(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    await user.update({ status: true });
  }

  async deactivate(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    await user.update({ status: false });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    // Delete old avatar file if exists
    if ((user as any).avatar_url) {
      const oldPath = path.join(process.cwd(), (user as any).avatar_url.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Nie udało się usunąć starego avatara:', e);
        }
      }
    }

    await user.update({ avatar_url: avatarUrl });
    return await this.getUserWithRole(userId);
  }

  async deleteAvatar(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Użytkownik nie został znaleziony');
    }

    if ((user as any).avatar_url) {
      const oldPath = path.join(process.cwd(), (user as any).avatar_url.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Nie udało się usunąć avatara:', e);
        }
      }
    }

    await user.update({ avatar_url: null });
    return await this.getUserWithRole(userId);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    await user.destroy();
    return true;
  }
}

export const userService = new UserService();
