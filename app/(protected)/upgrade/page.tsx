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
        <main className="mx-auto flex max-w-3xl justify-center">
          <PricingGrid userPlan={userPlan} />
        </main>
        <div className="mt-8 text-center">
          <Link href="/library" className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
