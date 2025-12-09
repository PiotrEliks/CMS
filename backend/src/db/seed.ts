import bcrypt from 'bcryptjs';
import { sequelize } from './sequelize.js';
import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';

export async function ensureAdminSeed() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const plain = process.env.ADMIN_PASSWORD ?? 'admin!';

  await sequelize.transaction(async (t) => {
    const [adminRole] = await Role.findOrCreate({
      where: { type: 'admin' },
      defaults: {
        type: 'admin',
        display_name: 'Administrator',
      },
      transaction: t,
    });

    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) {
      return;
    }

    const password_hash = await bcrypt.hash(plain, 10);

    await User.create(
      {
        email,
        password_hash,
        display_name: 'Administrator',
        role_id: adminRole.role_id,
        last_access: null,
        status: true,
      },
      { transaction: t }
    );

    console.log(`✅ Seeded admin: ${email} / ${plain}`);
  });
}
