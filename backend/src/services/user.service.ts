import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Role } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';
import { generateRandomPassword } from '../utils/password.js';
import { sendNewUserCredentialsMail } from '../utils/mailer.js';

/**
 * Hash password with bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with hash
 */
async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  /**
   * Create new user with password hashing
   */
  async create(data: {
    email: string;
    display_name?: string;
    password: string;
    role_id?: string | null;
    avatar_url?: string;
    is_active?: boolean;
  }) {
    // Check if email already exists
    const existing = await User.findOne({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);

    return await super.create({
      ...data,
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      is_active: data.is_active !== false,
    } as any);
  }

  /**
   * Update user (excluding password)
   */
  async updateUser(userId: string, data: { email?: string; display_name?: string; avatar_url?: string; is_active?: boolean }) {
    // If email is being changed, check uniqueness
    if (data.email) {
      const existing = await User.findOne({
        where: {
          email: data.email.toLowerCase(),
          user_id: { [Op.ne]: userId },
        },
      });
      if (existing) {
        throw new Error('Email already in use');
      }
    }

    const updatePayload: any = {
      email: data.email?.toLowerCase(),
    };
    if (data.display_name !== undefined) updatePayload.display_name = data.display_name;
    if (data.avatar_url !== undefined) updatePayload.avatar_url = data.avatar_url;
    if (data.is_active !== undefined) updatePayload.status = data.is_active;

    return await this.update(userId, updatePayload);
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    return comparePassword(password, (user as any).password_hash);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    const isValid = await comparePassword(oldPassword, (user as any).password_hash);
    if (!isValid) throw new Error('Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    await this.update(userId, { password_hash: passwordHash } as any);
  }

  /**
   * Reset user password (by admin)
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await this.update(userId, { password_hash: passwordHash } as any);
  }

  /**
   * Get user with role
   */
  async getUserWithRole(userId: string) {
    return await this.findOne({
      where: { user_id: userId },
      include: [{ model: Role, as: 'role' }],
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return await this.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Role, as: 'role' }],
    });
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Role not found');

    await this.update(userId, { role_id: roleId } as any);
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string): Promise<void> {
    await this.update(userId, { role_id: null } as any);
  }

  /**
   * Deactivate user
   */
  async deactivate(userId: string): Promise<void> {
    await this.update(userId, { is_active: false } as any);
  }

  /**
   * Activate user
   */
  async activate(userId: string): Promise<void> {
    await this.update(userId, { is_active: true } as any);
  }

  /**
   * List users with role information
   */
  async listWithRoles(options: PaginationOptions & FindOptions) {
    return await this.list({
      ...options,
      include: [{ model: Role, as: 'role' }],
    });
  }

  /**
   * Search users by email or name
   */
  async search(query: string, options: PaginationOptions) {
    return await this.list({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { display_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Role, as: 'role' }],
      limit: options.limit,
      offset: options.offset,
    });
  }

  /**
   * Create user with random password and send email
   */
  async createWithEmail(data: { email: string; display_name?: string; role_id?: string | null; status?: boolean }): Promise<any> {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      throw new Error('Użytkownik o podanym adresie email już istnieje');
    }

    const plainPassword = generateRandomPassword(12);
    const passwordHash = await hashPassword(plainPassword);

    const user = await super.create({
      email: data.email,
      display_name: data.display_name,
      role_id: data.role_id,
      password_hash: passwordHash,
      status: data.status !== false,
    } as any);

    // Send email non-blocking
    sendNewUserCredentialsMail({
      to: data.email,
      password: plainPassword,
    }).catch(err => console.error('Email error:', err));

    return await this.getUserWithRole((user as any).user_id);
  }

  /**
   * Update user and return with role
   */
  async updateAndFetch(userId: string, data: { email?: string; display_name?: string; avatar_url?: string; status?: boolean }): Promise<any> {
    const user = await this.findById(userId);
    if (!user) throw new Error('Użytkownik nie został znaleziony');

    if (data.email && data.email !== (user as any).email) {
      const existing = await User.findOne({
        where: {
          email: data.email,
          user_id: { [Op.ne]: userId },
        },
      });
      if (existing) throw new Error('Użytkownik o podanym adresie email już istnieje');
    }

    const updatePayload: any = {};
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.display_name !== undefined) updatePayload.display_name = data.display_name;
    if (data.avatar_url !== undefined) updatePayload.avatar_url = data.avatar_url;
    if (data.status !== undefined) updatePayload.status = data.status;

    await this.update(userId, updatePayload);
    return await this.getUserWithRole(userId);
  }

  async changePasswordForUser(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new Error('Aby zmienić hasło, podaj zarówno aktualne, jak i nowe hasło.');
    }

    const user = await this.findById(userId);
    if (!user) throw new Error('Użytkownik nie został znaleziony');

    const isValid = await bcrypt.compare(currentPassword, (user as any).password_hash);
    if (!isValid) throw new Error('Aktualne hasło jest nieprawidłowe.');

    if (newPassword.length < 8) {
      throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.update(userId, { password_hash: hashed } as any);
  }

  /**
   * Change password for user by id
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    const isValid = await comparePassword(oldPassword, (user as any).password_hash);
    if (!isValid) throw new Error('Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    await this.update(userId, { password_hash: passwordHash } as any);
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<any> {
    await this.update(userId, { avatar_url: avatarUrl } as any);
    return await this.getUserWithRole(userId);
  }

  async removeAvatarUrl(userId: string): Promise<any> {
    await this.update(userId, { avatar_url: null } as any);
    return await this.getUserWithRole(userId);
  }
}

export const userService = new UserService();
