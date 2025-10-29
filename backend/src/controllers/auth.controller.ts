import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as AuthService from '../services/auth.service.js';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { accessToken, user } = await AuthService.loginWithEmail(email, password);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60
  });

  return res.status(200).json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return res.status(200).json({ ok: true });
});

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json({ authenticated: true, user: (req as any).user });
});
