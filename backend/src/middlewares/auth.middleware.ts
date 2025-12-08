import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, User } from '../models/index.js';

type JwtPayload = {
  sub: string;
  email: string;
  role?: string;
  display_name?: string;
  last_access?: string;
  iat: number;
  exp: number;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.access_token as string | undefined;
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined;

    const token = cookieToken ?? headerToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const payload = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findOne({
      where: { user_id: payload.sub },
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role' }],
    });

    (req as any).user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
