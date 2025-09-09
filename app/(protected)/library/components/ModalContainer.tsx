import type { FC } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

import type { ModalContainerProps } from '../types';

export const ModalContainer: FC<ModalContainerProps> = ({ onClose, children, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close modal"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <h2 className="mb-6 text-2xl font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  </div>
);
