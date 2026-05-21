'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  isPending = false,
  onConfirm,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded p-5 shadow-xl">
          <Dialog.Title className="text-base font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`px-3 py-1.5 text-sm font-medium text-white rounded disabled:opacity-40 ${
                destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPending ? '처리 중...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
