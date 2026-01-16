import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeCloseIcon, EyeIcon } from '../../icons'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import Checkbox from '../form/input/Checkbox'
import Button from '../ui/button/Button'
import { useAuth } from '../../store/auth'

export default function SignInForm() {
    const navigate = useNavigate()
    const { login, error, clearError, loading } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [keepSignedIn, setKeepSignedIn] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        clearError()
        try {
            await login(email, password, keepSignedIn)
            if (keepSignedIn) localStorage.setItem('keepSignedIn', '1')
            navigate('/', { replace: true })
        } catch {}
    }

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Logowanie
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Wprowadź swój adres e-mail i hasło, aby się
                            zalogować!
                        </p>
                    </div>

                    <div>
                        <form onSubmit={onSubmit} noValidate>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Email{' '}
                                        <span className="text-error-500">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="info@gmail.com"
                                        value={email}
                                        onChange={(e: any) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <Label>
                                        Hasło{' '}
                                        <span className="text-error-500">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            name="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Wpisz swoje hasło"
                                            value={password}
                                            onChange={(e: any) =>
                                                setPassword(e.target.value)
                                            }
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                            aria-label={
                                                showPassword
                                                    ? 'Ukryj hasło'
                                                    : 'Pokaż hasło'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={keepSignedIn}
                                            onChange={setKeepSignedIn}
                                        />
                                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                            Zapamiętaj mnie
                                        </span>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Zapomniałeś hasła?
                                    </Link>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                                    >
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        disabled={loading}
                                    >
                                        {loading ? 'Logowanie…' : 'Zaloguj się'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
