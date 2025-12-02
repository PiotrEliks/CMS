import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Role } from '../../models/role.model.js';

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await Role.findAll({
    order: [['display_name', 'ASC']],
  });

  return res.status(200).json({ roles });
});
