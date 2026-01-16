import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role, User, Permission } from '../models/index.js'

type JwtPayload = {
    sub: string
    email: string
    iat: number
    exp: number
}

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const cookieToken = req.cookies?.access_token as string | undefined
        const headerToken = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : undefined

        const token = cookieToken ?? headerToken
        if (!token) return res.status(401).json({ error: 'Unauthorized' })

        const secret = process.env.JWT_SECRET
        if (!secret) throw new Error('JWT_SECRET is not set')

        const payload = jwt.verify(token, secret) as JwtPayload

        const user = await User.findOne({
            where: { user_id: payload.sub },
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Role,
                    as: 'role',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                        },
                    ],
                },
            ],
        })

        if (!user) return res.status(401).json({ error: 'Unauthorized' })

        const plain = user.toJSON() as any

        const permissions: string[] =
            plain.role?.permissions?.map((p: any) => p.code) ?? []

        ;(req as any).user = {
            ...plain,
            permissions,
        }

        next()
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
