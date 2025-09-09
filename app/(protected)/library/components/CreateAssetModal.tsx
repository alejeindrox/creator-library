'use client';

import type { FC } from 'react';

import { useCreateAssetForm } from './hooks/useCreateAssetForm';
import { AssetFormFields } from './AssetFormFields';
import { ModalContainer } from './ModalContainer';
import type { CreateAssetModalProps } from '../types';

export const CreateAssetModal: FC<CreateAssetModalProps> = ({ onClose }) => {
  const { state, formAction, formRef } = useCreateAssetForm(onClose);

  return (
    <ModalContainer onClose={onClose} title="Create New Asset">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <AssetFormFields state={state} />
        {state.message && !state.success && (
          <p className="text-center text-sm font-medium text-red-500">{state.message}</p>
        )}
        {state.message && state.success && (
          <p className="text-center text-sm font-medium text-green-500">{state.message}</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Asset
        </button>
      </form>
    </ModalContainer>
  );
};
