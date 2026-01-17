import { Request, Response, NextFunction } from 'express'

type ReqUser = {
  user_id: string
  permissions?: string[]
  role?: { type?: string }
}

export function authorize(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as ReqUser | undefined
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (user.role?.type === 'admin') {
      return next()
    }

    const userPerms = user.permissions ?? []

    const hasAll = requiredPermissions.every((perm) => userPerms.includes(perm))

    if (!hasAll) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
