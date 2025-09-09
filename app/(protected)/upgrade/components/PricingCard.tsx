'use client';

import type { FC } from 'react';

import { useSelectPlan } from './hooks/useSelectPlan';
import { PricingCardProps } from '../types';

export const PricingCard: FC<PricingCardProps> = ({ title, price, features, isCurrent, isRecommended }) => {
  const { isLoading, handleSelectPlan } = useSelectPlan();

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-6 shadow-lg ${isRecommended ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
          Recommended
        </span>
      )}
      <h2 className="mb-4 text-center text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mb-6 text-center text-4xl font-extrabold text-slate-900">{price}</p>
      <ul className="mb-8 flex-grow space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={`w-full rounded-md px-6 py-3 text-lg font-semibold ${isCurrent ? 'cursor-not-allowed bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        disabled={isCurrent || isLoading}
        onClick={() => handleSelectPlan(title)}
      >
        {isLoading ? 'Updating...' : (isCurrent ? 'Current Plan' : 'Select Plan')}
      </button>
    </div>
  );
};
