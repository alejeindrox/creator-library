'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

import { CreateAssetModal } from './CreateAssetModal';

export const CreateAssetButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        aria-label="Create new asset"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
      {isOpen && <CreateAssetModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
