import type { FC } from 'react';

export const EmptyLibrary: FC = () => (
  <div className="text-center">
    <p className="text-xl text-gray-600">Your library is empty.</p>
    <p className="mt-2 text-gray-500">¡Start adding assets to see them here!</p>
  </div>
);
