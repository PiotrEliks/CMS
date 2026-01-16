import { Loader2 } from 'lucide-react'

export default function Loader({ text = 'Ładowanie...' }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-row items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {text}
        </p>
      </div>
    </div>
  )
}
