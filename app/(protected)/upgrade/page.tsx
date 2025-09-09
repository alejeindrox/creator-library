import type { FC } from 'react';
import Link from 'next/link';

import { UpgradeHeader } from './components/UpgradeHeader';
import { PricingGrid } from './components/PricingGrid';
import { getSessionUser } from '@/lib/auth.server';

const UpgradePage: FC = async () => {
  const user = await getSessionUser();
  const userPlan = user?.plan || 'basic';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <UpgradeHeader />
        <main className="flex justify-center max-w-3xl mx-auto">
          <PricingGrid userPlan={userPlan} />
        </main>
        <div className="text-center mt-8">
          <Link href="/library" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
