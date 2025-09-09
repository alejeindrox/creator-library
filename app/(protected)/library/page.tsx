import { getLibraryAssets } from './actions';
import { LibraryHeader } from './components/LibraryHeader';
import { EmptyLibrary } from './components/EmptyLibrary';
import { AssetGrid } from './components/AssetGrid';
import { CreateAssetButton } from './components/CreateAssetButton';

export default async function LibraryPage() {
  const assets = await getLibraryAssets();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <LibraryHeader />
        <main>{assets.length === 0 ? <EmptyLibrary /> : <AssetGrid assets={assets} />}</main>
      </div>
      <CreateAssetButton />
    </div>
  );
}
