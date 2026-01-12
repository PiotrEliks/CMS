import { useState } from 'react';
import { useAuth } from '../../store/auth';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import PageMeta from '../../components/common/PageMeta';

export default function ForgotPasswordFormPage() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {}
  }

  return (
    <>
      <PageMeta title='Zapomniane hasło' description='Strona resetowania hasła w panelu administracyjnym' />
      <div className="h-screen flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-md p-6 bg-white rounded-xl dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Zapomniałeś hasła?
          </h1>

          {sent ? (
            <p className="text-green-600 dark:text-green-400">
              Jeśli konto istnieje — wysłaliśmy link do resetu hasła.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Podaj swój email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button className="w-full" disabled={loading}>
                {loading ? 'Wysyłanie…' : 'Wyślij link resetujący'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
