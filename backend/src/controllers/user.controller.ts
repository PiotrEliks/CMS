import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { userService } from '../services/user.service.js';

/**
 * Create user (admin only)
 * POST /api/admin/users
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, display_name, password, role_id, avatar_url } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await userService.create({
      email,
      display_name,
      password,
      role_id,
      avatar_url,
    });

    return res.status(201).json({
      user_id: (user as any).user_id,
      email: (user as any).email,
      display_name: (user as any).display_name,
      role_id: (user as any).role_id,
      is_active: (user as any).is_active,
    });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Get current user
 * GET /api/admin/users/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await userService.getUserWithRole(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await userService.getUserWithRole(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

/**
 * List users
 * GET /api/admin/users?limit=20&offset=0
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { items, total } = await userService.listWithRoles({
    where: {},
    limit,
    offset,
  });

  return res.json({ items, total, limit, offset });
});

/**
 * Search users
 * GET /api/admin/users/search?q=john&limit=20&offset=0
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const { items, total } = await userService.search(query, { limit, offset });

  return res.json({ items, total, limit, offset });
});

/**
 * Update user
 * PUT /api/admin/users/:id
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, display_name, avatar_url, is_active } = req.body;

  try {
    const user = await userService.updateUser(id, {
      email,
      display_name,
      avatar_url,
      is_active,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Change user password
 * POST /api/admin/users/:id/change-password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new password are required' });
  }

  try {
    await userService.changePassword(id, oldPassword, newPassword);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Reset user password (admin only)
 * POST /api/admin/users/:id/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    await userService.resetPassword(id, newPassword);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Assign role to user
 * POST /api/admin/users/:id/role
 */
export const assignRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ error: 'Role ID is required' });
  }

  try {
    await userService.assignRole(id, roleId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Remove role from user
 * DELETE /api/admin/users/:id/role
 */
export const removeRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await userService.removeRole(id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Deactivate user
 * POST /api/admin/users/:id/deactivate
 */
export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await userService.deactivate(id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Activate user
 * POST /api/admin/users/:id/activate
 */
export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await userService.activate(id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await userService.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ ok: true });
});
