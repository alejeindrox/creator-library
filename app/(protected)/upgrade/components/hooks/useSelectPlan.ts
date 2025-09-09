'use client';

import { useState } from 'react';

import { updatePlan } from '../../actions';
import { Plan } from '@/lib/domain/types';

export const useSelectPlan = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planTitle: string) => {
    setIsLoading(true);
    await updatePlan(planTitle.toLowerCase() as Plan);
    setIsLoading(false);
  };

  return { isLoading, handleSelectPlan };
};
