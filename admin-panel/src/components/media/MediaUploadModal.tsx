import { useState, useRef } from 'react';
import { UploadCloud, XCircle } from 'lucide-react';
import Button from '../ui/button/Button';
import { useMedia } from '../../store/media';

export default function MediaUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { upload, loading } = useMedia();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContainerClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    await upload(file, { title, alt_text: alt });
    setFile(null);
    setTitle('');
    setAlt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dodaj plik</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div
            onClick={handleContainerClick}
            className={`
              relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 
              transition-all duration-200 
              ${
                file
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10 cursor-default'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf, .jpg, .jpeg, .webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Usuń plik"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}

            <UploadCloud
              className={`w-10 h-10 mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`}
            />

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {file ? 'Wybrano plik:' : 'Kliknij, aby wybrać plik'}
              </p>
              <p className="mt-1 text-xs text-gray-500 max-w-[250px] truncate">
                {file ? file.name : 'PDF, JPG lub WebP'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł (opcjonalnie)"
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:border-gray-700 dark:text-white"
            />
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="ALT (dla obrazów, opcjonalnie)"
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Anuluj
            </Button>
            <Button size="sm" disabled={loading || !file}>
              {loading ? 'Wgrywanie…' : 'Dodaj plik'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
