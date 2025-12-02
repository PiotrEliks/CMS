import React from "react";
import Button from "../../ui/button/Button";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  open,
  title = "Potwierdź usunięcie",
  message = "Czy na pewno chcesz usunąć ten element? Tej operacji nie można cofnąć.",
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-red-600 dark:text-red-300"
              fill="none"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Anuluj
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
          >
            Usuń
          </Button>
        </div>
      </div>
    </div>
  );
}
