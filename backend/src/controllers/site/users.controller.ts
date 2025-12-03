import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { User } from '../../models/user.model.js';
import { Role } from '../../models/role.model.js';
import { generateRandomPassword, hashPassword } from '../../utils/password.js';
import { sendNewUserCredentialsMail } from '../../utils/mailer.js';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role_id?: string;
    email?: string;
  };
}

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Role, as: 'role' }],
  });

  return res.status(200).json({ users });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password_hash'] },
  });

  return res.status(200).json({ user });
});

export const addUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, display_name, role_id, status } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Użytkownik o podanym adresie email już istnieje' });
  }

  const plainPassword = generateRandomPassword(12);

  const password_hash = await hashPassword(plainPassword);

  const user = await User.create({
    email,
    display_name,
    role_id,
    status: typeof status === 'boolean' ? status : true,
    password_hash,
  });

  try {
    await sendNewUserCredentialsMail({
      to: email,
      password: plainPassword,
    });
  } catch (err) {
    console.error('Nie udało się wysłać maila z danymi logowania:', err);
  }

  const safeUser = await User.findByPk(user.user_id, {
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Role, as: 'role' }],
  });

  return res.status(201).json({ user: safeUser });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, display_name, role_id, status, password } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing && existing.get('user_id') !== user.get('user_id')) {
      return res.status(400).json({ error: 'Użytkownik o podanym adresie email już istnieje' });
    }
  }

  await user.update({
    email: email ?? user.email,
    display_name: display_name ?? user.display_name,
    role_id: role_id ?? user.role_id,
    ...(typeof status === 'boolean' ? { status } : {}),
  });

  const updatedUser = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Role, as: 'role' }],
  });

  return res.status(200).json({ user: updatedUser });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
  }

  await user.destroy();

  return res.status(200).json({ success: true });
});

export const updateCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.user_id) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  const userId = req.user.user_id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
  }

  const {
    display_name,
    email,
    current_password,
    new_password,
  }: {
    display_name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  } = req.body;

  const updatePayload: any = {};

  if (display_name !== undefined) {
    updatePayload.display_name = display_name;
  }

  if (email !== undefined && email !== user.email) {
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing && existing.get('user_id') !== user.get('user_id')) {
      return res.status(400).json({ error: 'Użytkownik o podanym adresie email już istnieje' });
    }
    updatePayload.email = normalizedEmail;
  }

  if (current_password || new_password) {
    if (!current_password || !new_password) {
      return res
        .status(400)
        .json({ error: 'Aby zmienić hasło, podaj zarówno aktualne, jak i nowe hasło.' });
    }

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Aktualne hasło jest nieprawidłowe.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Nowe hasło musi mieć co najmniej 8 znaków.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    updatePayload.password_hash = hashed;
  }

  if (Object.keys(updatePayload).length > 0) {
    await user.update(updatePayload);
  }

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Role, as: 'role' }],
  });

  return res.status(200).json({ user: updatedUser });
});
