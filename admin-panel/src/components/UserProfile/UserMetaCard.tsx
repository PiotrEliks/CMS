import { useRef, useState } from 'react'
import { useAuth } from '../../store/auth'
import Button from '../ui/button/Button'

export default function UserMetaCard() {
  const { user, avatarLoading, uploadAvatar, deleteAvatar } = useAuth()

  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Dozwolone są tylko pliki graficzne.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Plik jest za duży (maks. 2 MB).')
      return
    }

    try {
      setAvatarError(null)
      await uploadAvatar(file)
    } catch {
      setAvatarError('Nie udało się zaktualizować zdjęcia profilowego.')
    } finally {
      e.target.value = ''
    }
  }

  const handleAvatarDelete = async () => {
    try {
      setAvatarError(null)
      await deleteAvatar()
    } catch {
      setAvatarError('Nie udało się usunąć zdjęcia profilowego.')
    }
  }

  const avatarSrc = user?.avatar_url ?? '/uploads/avatars/default-avatar.jpg'

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img
                  src={`${import.meta.env.VITE_API_UPLOADS}${avatarSrc}`}
                  alt={user?.display_name ?? 'User avatar'}
                  className="object-cover w-full h-full"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 right-0 bottom-0 hover:bg-gray-50 disabled:opacity-60"
                aria-label="Zmień zdjęcie profilowe"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleAvatarDelete}
              disabled={avatarLoading || !user?.avatar_url}
            >
              Usuń zdjęcie
            </Button>

            {avatarError && (
              <p className="text-xs text-red-500 text-center max-w-[180px]">
                {avatarError}
              </p>
            )}
            {avatarLoading && !avatarError && (
              <p className="text-xs text-gray-500">Przetwarzanie zdjęcia…</p>
            )}
          </div>

          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.display_name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.role?.display_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
