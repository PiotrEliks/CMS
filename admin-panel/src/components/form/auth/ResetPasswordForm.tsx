import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../store/auth';
import Label from '../Label';
import Input from '../input/InputField';
import Button from '../../ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '../../../icons';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function ResetPasswordForm() {
  const { token } = useParams();
  const { resetPassword, loading, error, clearError } = useAuth();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!password || !passwordConfirm) {
      setLocalError('Wpisz i potwierdź nowe hasło.');
      return;
    }

    if (password !== passwordConfirm) {
      setLocalError('Hasła nie są identyczne.');
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setLocalError(
        'Hasło musi mieć co najmniej 8 znaków, jedną małą literę, jedną wielką literę i jeden znak specjalny.'
      );
      return;
    }

    try {
      await resetPassword(token!, password);
      navigate('/login');
    } catch {}
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center flex-1">
      <div className="w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Ustaw nowe hasło
        </h1>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <Label>Nowe hasło</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Wpisz nowe hasło"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label>Powtórz nowe hasło</Label>
            <div className="relative">
              <Input
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="Powtórz nowe hasło"
                value={passwordConfirm}
                onChange={(e: any) => setPasswordConfirm(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                aria-label={showPasswordConfirm ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPasswordConfirm ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </button>
            </div>
          </div>

          {(localError || error) && (
            <div className="px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {localError ?? error}
            </div>
          )}

          <Button className="w-full" disabled={loading}>
            {loading ? 'Zapisywanie…' : 'Zmień hasło'}
          </Button>
        </form>
      </div>
    </div>
  );
}
