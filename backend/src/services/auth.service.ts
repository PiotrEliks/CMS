import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Role } from '../models/index.js';

export async function loginWithEmail(email: string, password: string) {
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
    include: [{ model: Role, as: 'role' }],
  });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  user.last_access = new Date();
  await user.save();

  const accessToken = jwt.sign(
    { sub: user.user_id, email: user.email, role: user.role_id },
    secret,
    { expiresIn: '1h' }
  );

  const plain = user.toJSON() as any;

  return {
    accessToken,
    user: {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      display_name: user.display_name,
      last_access: user.last_access,
      role: plain.role,
    },
  };
}
