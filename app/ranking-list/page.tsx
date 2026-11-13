import Navbar from "@/components/Navbar";
import RankingListSection from "@/components/RankingListSection";
import { RankingList } from '@/lib/models/RankingList';
import { Suspense } from 'react';

async function getRankingLists(): Promise<RankingList[]> {
  try {
    const response = await fetch('http://localhost:80/api/ranking-list', {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch ranking list');
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ranking list:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';


function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function RankingListPage() {
  const rankingLists = await getRankingLists();

  const listsWithRecipes = rankingLists.filter(list => 
    list.recipes && list.recipes.length > 0
  );

  return (
    <>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sve Rang Liste</h1>
          <p className="text-lg text-gray-600">
            Otkrijte najbolje recepte koje su naši moderatori odabrali za vas
          </p>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          {listsWithRecipes.length > 0 ? (
            <RankingListSection 
              rankingLists={listsWithRecipes}
              title=""
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Trenutno nema rang lista
              </h2>
              <p className="text-gray-500">
                Vratite se kasnije kako biste videli najbolje recepte.
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </>
  );
}