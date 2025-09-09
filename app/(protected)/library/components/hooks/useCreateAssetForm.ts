import { useEffect, useRef, useActionState } from 'react';

import { createAssetAction } from '../../actions';
import type { CreateAssetFormState } from '../../types';

export const useCreateAssetForm = (onClose: () => void) => {
  const [state, formAction] = useActionState<CreateAssetFormState, FormData>(createAssetAction, {
    message: null,
    errors: {},
    success: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onClose();
    }
  }, [state.success, onClose]);

  return { state, formAction, formRef };
};
