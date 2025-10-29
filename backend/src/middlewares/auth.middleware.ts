import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = { sub: string; email: string; role?: string; iat: number; exp: number };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
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

    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? 'user'
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
