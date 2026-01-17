import Button from '../ui/button/Button'
import type { MediaUsagePlace } from '../../store/media'

export default function MediaInUseModal({
  open,
  places,
  onClose,
}: {
  open: boolean
  places: MediaUsagePlace[]
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Nie można usunąć zasobu
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Ten plik jest aktualnie wykorzystywany w poniższych miejscach:
        </p>

        <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
          {places.map((p: any, idx: number) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
            >
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">
                  {p.type === 'content.cover' ? 'Okładka' : 'Treść'}
                </span>{' '}
                — {p.title}
              </p>
              <p className="text-xs text-gray-500">Slug: {p.slug}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button size="sm" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
