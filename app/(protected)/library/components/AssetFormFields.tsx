import type { FC } from 'react';

import type { AssetFormFieldsProps } from '../types';

export const AssetFormFields: FC<AssetFormFieldsProps> = ({ state }) => (
  <>
    <div>
      <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
        Title
      </label>
      <input
        type="text"
        id="title"
        name="title"
        required
        className="w-full rounded-md border border-gray-300 p-2 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
      />
      {state.errors?.title && <p className="mt-1 text-sm text-red-500">{state.errors.title[0]}</p>}
    </div>
    <div>
      <label htmlFor="url" className="mb-1 block text-sm font-medium text-gray-700">
        Image URL
      </label>
      <input
        type="url"
        id="url"
        name="url"
        placeholder="https://picsum.photos/300/300"
        required
        className="w-full rounded-md border border-gray-300 p-2 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
      />
      {state.errors?.url && <p className="mt-1 text-sm text-red-500">{state.errors.url[0]}</p>}
    </div>
  </>
);
