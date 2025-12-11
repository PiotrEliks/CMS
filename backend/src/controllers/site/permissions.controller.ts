import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Permission } from '../../models/index.js';

export const listPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await Permission.findAll({
    order: [['code', 'ASC']],
  });

  return res.status(200).json({ permissions });
});
