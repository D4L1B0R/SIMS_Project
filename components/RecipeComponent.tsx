"use client";
import { RecipeDTO, SessionUser } from '@/lib/dtos';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RecipeComponent({ recipe, refreshData }: { recipe: RecipeDTO; refreshData: () => void }) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  function handleClick() {
      router.push(`/recipe/${recipe.id}`);
    }

  const handleDeleteRecipe = async (recipeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Da li ste sigurni da želite da obrišete recept? Ova akcija je nepovratna!')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipe?id=${recipeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju recepta');
      }
      
      alert('Recept je uspešno obrisan');
      refreshData(); 
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsDeleting(false);
    }
  };

  const isModerator = Boolean((session?.user as SessionUser)?.isModerator);
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  
  return (
    <>
      <div 
        onClick={handleClick}
        className="flex items-center justify-between w-full p-4 border-b border-gray-200 pl-12 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium">{recipe.title}</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">{recipe.createdAt.toLocaleString()}</span>
          {(isAdmin || isModerator) && (
            <button 
              onClick={(e) => handleDeleteRecipe(recipe.id, e)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Obriši recept"
              disabled={isDeleting}
            >
              {isDeleting ? 'Brisanje...' : <Trash2 size={16} />}
            </button>
          )}
        </div>
      </div>
    </>
  );
}