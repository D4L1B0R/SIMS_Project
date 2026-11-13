"use client";
import { Category, Heaviness } from '@/lib/generated/prisma';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/lib/models/Recipe';
import { 
  ChefHat, 
  Utensils, 
  Clock, 
  Users, 
  Eye,
  Calendar,
  Soup,
  Croissant,
  CupSoda,
  Pizza,
  EggFried,
  Beef
} from 'lucide-react';
import { useMemo } from 'react';

interface RecipeCardProps {
  recipe: any; 
}

// Konstante koje su iste na serveru i klijentu
const CATEGORY_ICONS = {
  DESSERT: { icon: Croissant, color: 'text-purple-500', bg: 'bg-purple-50' },
  SNACK: { icon: Pizza, color: 'text-green-500', bg: 'bg-green-50' },
  BREAKFAST: { icon: EggFried, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  DRINK: { icon: CupSoda, color: 'text-blue-500', bg: 'bg-blue-50' },
  LUNCH: { icon: Soup, color: 'text-red-500', bg: 'bg-red-50' },
  DINNER: { icon: Beef, color: 'text-orange-500', bg: 'bg-orange-50' }
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  
  const recipeInstance = new Recipe(recipe);

  // Odaberi ikonicu na osnovu kategorije - ovo je determinističko
  const categoryIcon = useMemo(() => {
    const category = recipeInstance.category || 'LUNCH';
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.LUNCH;
  }, [recipeInstance.category]);

  const IconComponent = categoryIcon.icon;

  const handleCardClick = () => {
    router.push(`/recipe/${recipeInstance.id}`);
  };

  const handleChefClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const userId = recipeInstance.getUserId();
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const translateCategory = (category: Category) => {
    const translations: Record<Category, string> = {
      DESSERT: 'Dezert',
      SNACK: 'Užina',
      BREAKFAST: 'Doručak',
      DRINK: 'Piće',
      LUNCH: 'Ručak',
      DINNER: 'Večera'
    };
    return translations[category] || category;
  };

  const translateHeaviness = (heaviness: Heaviness) => {
    const translations: Record<Heaviness, string> = {
      LIGHT: 'Lako',
      MEDIUM: 'Srednje',
      HEAVY: 'Teško'
    };
    return translations[heaviness] || heaviness;
  };

  if (!recipe) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full cursor-pointer border border-gray-200"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <div className={`${categoryIcon.bg} h-full flex flex-col items-center justify-center p-4 border-r`}>
            <IconComponent className={`w-16 h-16 ${categoryIcon.color} mb-3`} />
          </div>
        </div>

        <div className="md:w-2/3 p-4 md:p-6">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                {recipeInstance.title || 'Bez naslova'}
              </h2>
              <span 
                onClick={handleChefClick}
                className="text-blue-600 hover:underline cursor-pointer text-sm"
              >
                {recipeInstance.getChefName()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">Kategorija</h3>
                  <p className="text-blue-600 text-sm">
                    {recipeInstance.category ? translateCategory(recipeInstance.category) : 'Nepoznato'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">Broj porcija</h3>
                  <p className="text-gray-600 text-sm">
                    {recipeInstance.number_of_portions || 'Nepoznato'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">Težina</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    recipeInstance.heaviness === 'LIGHT' 
                      ? 'bg-green-100 text-green-800' 
                      : recipeInstance.heaviness === 'MEDIUM' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {recipeInstance.heaviness ? translateHeaviness(recipeInstance.heaviness) : 'Nepoznato'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">Vreme pripreme</h3>
                  <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    recipeInstance.preparation_time < 30 
                      ? 'bg-green-100 text-green-800' 
                      : recipeInstance.preparation_time < 45 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {recipeInstance.preparation_time || 0} min
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Pregleda: {recipeInstance.number_of_views || 0}</span>
                <span>Kreirano: {recipeInstance.createdAt ? formatDate(recipeInstance.createdAt) : 'Nepoznato'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}