"use client";

import { RankingList } from '@/lib/models/RankingList';
import RecipeCard from './RecipeCard';

interface RankingListSectionProps {
  rankingLists: RankingList[];
  title: string;
}

export default function RankingListSection({ rankingLists, title }: RankingListSectionProps) {
  return (
    <div className="space-y-8">
      {title && (
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
      )}
      
      {rankingLists.map((rankingList) => (
        <div key={rankingList.id} className="border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {rankingList.description}
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Kreirano: {new Date(rankingList.created_at).toLocaleDateString('sr-RS')}</p>
                  <p>Ažurirano: {new Date(rankingList.updated_at).toLocaleDateString('sr-RS')}</p>
                  <p>Moderator ID: {rankingList.moderatorId}</p>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {rankingList.recipes?.length || 0} recepata
              </div>
            </div>
          </div>
          
          <div className="h-[400px] overflow-y-auto p-6">
            <div className="space-y-6">
              {rankingList.recipes?.map((recipe, index) => (
                <div key={recipe.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <RecipeCard recipe={recipe} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}