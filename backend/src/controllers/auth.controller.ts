import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as AuthService from '../services/auth.service.js';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { sendPasswordResetMail } from '../utils/mailer.js';
import { hashPassword } from '../utils/password.js';
import { Op } from 'sequelize';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, keepSignedIn } = req.body as {
    email?: string;
    password?: string;
    keepSignedIn?: boolean;
  };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let accessToken: string;
  let user: any;

  try {
    const result = await AuthService.loginWithEmail(email, password);
    accessToken = result.accessToken;
    user = result.user;
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Invalid credentials' });
  }

  const maxAge = keepSignedIn ? 1000 * 60 * 60 * 24 * 180 : 1000 * 60 * 60;

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge,
  });

  return res.status(200).json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.status(200).json({ ok: true });
});

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json({ authenticated: true, user: (req as any).user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(200).json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.reset_token = token;
  user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 15);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await sendPasswordResetMail({
    to: user.email,
    link: resetLink,
  });

  res.json({ ok: true });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_token_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  user.password_hash = await hashPassword(newPassword);
  user.reset_token = null;
  user.reset_token_expires = null;

  await user.save();

  res.json({ ok: true });
});
