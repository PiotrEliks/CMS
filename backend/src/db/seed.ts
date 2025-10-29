import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';

export async function ensureAdminSeed() {
  const email = 'admin@admin.com';
  const exists = await User.findOne({ where: { email } });
  if (!exists) {
    await User.create({
      email,
      passwordHash: await bcrypt.hash('admin!', 10),
      role: 'admin'
    });
    console.log('Seeded admin: admin@admin.com / admin!');
  }
}
