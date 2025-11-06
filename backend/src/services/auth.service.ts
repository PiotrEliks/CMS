import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function loginWithEmail(email: string, password: string) {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  const accessToken = jwt.sign(
    { sub: user.user_id, email: user.email, role: user.role_id },
    secret,
    { expiresIn: '1h' }
  );

  return {
    accessToken,
    user: { id: user.user_id, email: user.email, role: user.role_id }
  };
}
