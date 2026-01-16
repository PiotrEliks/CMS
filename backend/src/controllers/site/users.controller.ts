import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { userService } from '../../services/user.service.js'

interface AuthRequest extends Request {
    user?: {
        user_id: string
        role_id?: string
        email?: string
    }
    file?: Express.Multer.File
}

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const { items, total } = await userService.listWithRoles({
        where: {},
        limit,
        offset,
    })

    return res.status(200).json({ users: items, total })
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserWithRole(req.params.id)

    if (!user) {
        return res
            .status(404)
            .json({ error: 'Użytkownik nie został znaleziony' })
    }

    return res.status(200).json({ user })
})

export const addUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, display_name, role_id, status } = req.body

    try {
        const user = await userService.createWithEmail({
            email,
            display_name,
            role_id,
            status: typeof status === 'boolean' ? status : true,
        })

        return res.status(201).json({ user })
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message })
    }
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { email, display_name, role_id, status } = req.body

    try {
        const user = await userService.updateUserData(id, {
            email,
            display_name,
            role_id,
            status,
        })

        return res.status(200).json({ user })
    } catch (error) {
        if ((error as Error).message === 'Użytkownik nie został znaleziony') {
            return res.status(404).json({ error: (error as Error).message })
        }
        return res.status(400).json({ error: (error as Error).message })
    }
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const deleted = await userService.deleteUser(id)

    if (!deleted) {
        return res
            .status(404)
            .json({ error: 'Użytkownik nie został znaleziony' })
    }

    return res.status(200).json({ success: true })
})

export const updateCurrentUser = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        if (!req.user?.user_id) {
            return res.status(401).json({ error: 'Brak autoryzacji' })
        }

        const { display_name, email, current_password, new_password } = req.body

        try {
            const user = await userService.updateCurrentUserProfile(
                req.user.user_id,
                {
                    display_name,
                    email,
                    current_password,
                    new_password,
                }
            )

            return res.status(200).json({ user })
        } catch (error) {
            if (
                (error as Error).message === 'Użytkownik nie został znaleziony'
            ) {
                return res.status(404).json({ error: (error as Error).message })
            }
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const updateAvatar = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        if (!req.user?.user_id) {
            return res.status(401).json({ error: 'Brak autoryzacji' })
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku avatara' })
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`

        try {
            const user = await userService.updateAvatar(
                req.user.user_id,
                avatarUrl
            )
            return res.status(200).json({ user })
        } catch (error) {
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const deleteAvatar = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        if (!req.user?.user_id) {
            return res.status(401).json({ error: 'Brak autoryzacji' })
        }

        try {
            const user = await userService.deleteAvatar(req.user.user_id)
            return res.status(200).json({ user })
        } catch (error) {
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const changePassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params
        const { current_password, new_password } = req.body

        try {
            await userService.changePassword(id, current_password, new_password)
            return res.status(200).json({ success: true })
        } catch (error) {
            if (
                (error as Error).message === 'Użytkownik nie został znaleziony'
            ) {
                return res.status(404).json({ error: (error as Error).message })
            }
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const resetPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params
        const { new_password } = req.body

        if (!new_password) {
            return res.status(400).json({ error: 'Nowe hasło jest wymagane' })
        }

        try {
            await userService.resetPassword(id, new_password)
            return res.status(200).json({ success: true })
        } catch (error) {
            if (
                (error as Error).message === 'Użytkownik nie został znaleziony'
            ) {
                return res.status(404).json({ error: (error as Error).message })
            }
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const assignRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { role_id } = req.body

    if (!role_id) {
        return res.status(400).json({ error: 'ID roli jest wymagane' })
    }

    try {
        await userService.assignRole(id, role_id)
        const user = await userService.getUserWithRole(id)
        return res.status(200).json({ user })
    } catch (error) {
        if ((error as Error).message === 'Użytkownik nie został znaleziony') {
            return res.status(404).json({ error: (error as Error).message })
        }
        return res.status(400).json({ error: (error as Error).message })
    }
})

export const removeRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        await userService.removeRole(id)
        const user = await userService.getUserWithRole(id)
        return res.status(200).json({ user })
    } catch (error) {
        if ((error as Error).message === 'Użytkownik nie został znaleziony') {
            return res.status(404).json({ error: (error as Error).message })
        }
        return res.status(400).json({ error: (error as Error).message })
    }
})

export const activateUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params

        try {
            await userService.activate(id)
            const user = await userService.getUserWithRole(id)
            return res.status(200).json({ user })
        } catch (error) {
            if (
                (error as Error).message === 'Użytkownik nie został znaleziony'
            ) {
                return res.status(404).json({ error: (error as Error).message })
            }
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)

export const deactivateUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params

        try {
            await userService.deactivate(id)
            const user = await userService.getUserWithRole(id)
            return res.status(200).json({ user })
        } catch (error) {
            if (
                (error as Error).message === 'Użytkownik nie został znaleziony'
            ) {
                return res.status(404).json({ error: (error as Error).message })
            }
            return res.status(400).json({ error: (error as Error).message })
        }
    }
)
