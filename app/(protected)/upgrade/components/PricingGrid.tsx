import type { FC } from 'react';

import { PricingCard } from './PricingCard';
import { plans } from '@/lib/domain/plans';
import { PricingGridProps } from '../types';

export const PricingGrid: FC<PricingGridProps> = ({ userPlan }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan, index) => (
        <PricingCard key={index} {...plan} isCurrent={plan.title.toLowerCase() === userPlan} />
      ))}
    </div>
  );
};
