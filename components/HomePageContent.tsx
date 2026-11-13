"use client";

import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/lib/models/Recipe';
import Advertisment from './Advertisment';
import { useSession } from 'next-auth/react';
import { SessionUser } from '@/lib/dtos';
import { Divide } from 'lucide-react';
import Link from 'next/link';

interface RecipeContentProps {
  recipes: Recipe[];
  searchQuery: string;
}

export default function HomePageContent({ recipes, searchQuery }: RecipeContentProps) {
  const { data: session } = useSession();
  const isPremium = (session?.user as SessionUser)?.privileged_user;
  console.log(isPremium)
  return (
    <div className="container mx-auto px-4 py-8">
        <div>
            <h1 className="text-3xl font-bold mb-8">
                {searchQuery ? `Rezultati pretrage za "${searchQuery}"` : 'Svi recepti'}
            </h1>
            <h2 className='underline text-lg mb-6'>
                <Link href="/ranking-list">Rang Liste Recepata</Link>
            </h2>
        </div>
      
      <div className="flex md:flex-row flex-col items-center justify-between gap-6">
        {recipes.length === 0 ? (
          <div className="text-center flex-4 text-gray-500 border rounded-lg shadow-sm">
            {searchQuery ? `Nema recepata za pretragu "${searchQuery}"` : 'Nema dostupnih recepta.'}
          </div>
        ) : (
          <div className="flex-4 border rounded-lg shadow-sm overflow-hidden">
            <div className="h-[650px] overflow-y-auto p-4 space-y-6">
              {recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                />
              ))}
            </div>
          </div>
        )}
        {!isPremium && (<div className='h-[400px] md:h-[650px] flex-1 max-w-xs w-xs'>
          <Advertisment />
        </div>)}
        
      </div>
    </div>
  );
}