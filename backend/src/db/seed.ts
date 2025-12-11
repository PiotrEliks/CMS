import bcrypt from 'bcryptjs';
import { sequelize } from './sequelize.js';
import { User } from '../models/user.model.js';
import { Role, Permission, RolePermission } from '../models/index.js';

const PERMISSIONS_SEED: { code: string; description: string }[] = [
  { code: 'system.access_admin_panel', description: 'Dostęp do panelu administracyjnego' },
  { code: 'system.manage_settings', description: 'Zarządzanie ustawieniami systemowymi' },

  { code: 'media.read', description: 'Podgląd plików' },
  { code: 'media.upload', description: 'Przesyłanie plików' },
  { code: 'media.replace', description: 'Nadpisywanie istniejących plików' },
  { code: 'media.delete', description: 'Usuwanie plików' },

  { code: 'content.read', description: 'Podgląd treści' },
  { code: 'content.create', description: 'Tworzenie treści' },
  { code: 'content.update_own', description: 'Edycja własnych treści' },
  { code: 'content.update_any', description: 'Edycja dowolnej treści' },
  { code: 'content.delete_own', description: 'Usuwanie własnych treści' },
  { code: 'content.delete_any', description: 'Usuwanie dowolnej treści' },
  { code: 'content.publish', description: 'Publikacja treści' },

  { code: 'users.read', description: 'Podgląd użytkowników' },
  { code: 'users.create', description: 'Tworzenie użytkowników' },
  { code: 'users.update', description: 'Edycja użytkowników' },
  { code: 'users.delete', description: 'Usuwanie użytkowników' },
  { code: 'users.change_password', description: 'Zmiana hasła użytkownika' },
  { code: 'users.change_roles', description: 'Zmiana ról użytkowników' },

  { code: 'roles.read', description: 'Podgląd ról' },
  { code: 'roles.create', description: 'Tworzenie ról' },
  { code: 'roles.update', description: 'Edycja ról' },
  { code: 'roles.delete', description: 'Usuwanie ról' },
  { code: 'roles.assign_permissions', description: 'Zarządzanie uprawnieniami ról' },
];

export async function ensureAdminSeed() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const adminPlain = process.env.ADMIN_PASSWORD ?? 'admin!';

  const moderatorEmail = process.env.MODERATOR_EMAIL ?? 'moderator@admin.com';
  const moderatorPlain = process.env.MODERATOR_PASSWORD ?? 'moderator!';

  await sequelize.transaction(async (t) => {
    for (const permDef of PERMISSIONS_SEED) {
      await Permission.findOrCreate({
        where: { code: permDef.code },
        defaults: {
          code: permDef.code,
          description: permDef.description,
        },
        transaction: t,
      });
    }

    const allPermissions = await Permission.findAll({ transaction: t });

    const [adminRole] = await Role.findOrCreate({
      where: { type: 'admin' },
      defaults: {
        type: 'admin',
        display_name: 'Administrator',
        status: true,
      },
      transaction: t,
    });

    const [moderatorRole] = await Role.findOrCreate({
      where: { type: 'moderator' },
      defaults: {
        type: 'moderator',
        display_name: 'Moderator',
        status: true,
      },
      transaction: t,
    });

    for (const perm of allPermissions) {
      await RolePermission.findOrCreate({
        where: {
          role_id: adminRole.role_id,
          permission_id: perm.permission_id,
        },
        defaults: {
          role_id: adminRole.role_id,
          permission_id: perm.permission_id,
        },
        transaction: t,
      });
    }

    const moderatorPermissions = allPermissions.filter((perm: any) => {
      const code: string = perm.code;
      if (!code) return false;
      if (code.startsWith('users.')) return false;
      if (code.startsWith('roles.')) return false;
      return true;
    });

    for (const perm of moderatorPermissions) {
      await RolePermission.findOrCreate({
        where: {
          role_id: moderatorRole.role_id,
          permission_id: perm.permission_id,
        },
        defaults: {
          role_id: moderatorRole.role_id,
          permission_id: perm.permission_id,
        },
        transaction: t,
      });
    }

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
      transaction: t,
    });

    if (!existingAdmin) {
      const password_hash = await bcrypt.hash(adminPlain, 10);

      await User.create(
        {
          email: adminEmail,
          password_hash,
          display_name: 'Jan Nowak',
          role_id: adminRole.role_id,
          last_access: null,
          status: true,
        },
        { transaction: t }
      );

      console.log(`✅ Seeded admin: ${adminEmail} / ${adminPlain}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    const existingModerator = await User.findOne({
      where: { email: moderatorEmail },
      transaction: t,
    });

    if (!existingModerator) {
      const password_hash = await bcrypt.hash(moderatorPlain, 10);

      await User.create(
        {
          email: moderatorEmail,
          password_hash,
          display_name: 'Adam Kowalski',
          role_id: moderatorRole.role_id,
          last_access: null,
          status: true,
        },
        { transaction: t }
      );

      console.log(`✅ Seeded moderator: ${moderatorEmail} / ${moderatorPlain}`);
    } else {
      console.log(`ℹ️ Moderator already exists: ${moderatorEmail}`);
    }
  });
}
