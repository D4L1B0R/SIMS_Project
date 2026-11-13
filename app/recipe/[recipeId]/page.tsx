'use client';

import Navbar from '@/components/Navbar';
import { Clock, Users, ChefHat, Calendar, Eye, Edit, Trash2, Bookmark, Star, MessageSquare,  ChefHat as ChefIcon, Save, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RecipeDTO, SessionUser } from '@/lib/dtos';
import { Heaviness } from '@/lib/models/enums';
import { Category } from '@/lib/models/enums';
import Advertisment from '@/components/Advertisment';
import { Cookbook } from '@/lib/models/Cookbook';

interface CookbookWithBookmark extends Cookbook {
  isBookmarked: boolean;
  bookmarkId?: number;
}

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;
  const { data: session } = useSession();
  
  const [recipe, setRecipe] = useState<RecipeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [averageRating, setAverageRating] = useState(0); 
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<RecipeDTO> | null>(null);
  const [saving, setSaving] = useState(false);
  const [sessionChefBeginnerId, setSessionChefBeginnerId] = useState<number | null>(null);
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState(false);
  const [userCookbooks, setUserCookbooks] = useState<CookbookWithBookmark[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const sessionUserId = (session?.user as SessionUser)?.id;
  const recipeUserId = recipe?.chefBeginner?.userId?.toString();
  const isAdmin = (session?.user as SessionUser)?.isAdmin
  const isModerator =  (session?.user as SessionUser)?.isModerator
  const isSponsor =  (session?.user as SessionUser)?.isSponsor
  const isPremium = (session?.user as SessionUser)?.privileged_user || false;
  useEffect(() => {
    const fetchChefBeginnerId = async () => {
      try {
        const sessionUserId = (session?.user as SessionUser)?.id;
        
        if (sessionUserId && !(isAdmin || isModerator)) {
          const response = await fetch(`/api/chef-beginner?userId=${sessionUserId}`);
          
          if (response.ok) {
            const data = await response.json();
            setSessionChefBeginnerId(data.chefBeginner.id);
          } else {
            setSessionChefBeginnerId(null);
          }
        }
      } catch (error) {
        console.error('Greška pri dobijanju chefBeginnerId:', error);
      }
    };

    if (session?.user) {
      fetchChefBeginnerId();
    }
  }, [session]);

  const isRecipeOwner = Boolean(
    (sessionUserId && recipeUserId && sessionUserId.toString() === recipeUserId) ||
    (session?.user as SessionUser)?.isAdmin ||
    (session?.user as SessionUser)?.isModerator
  );


  const fetchBookmarkData = async () => {
    if (!session || isAdmin || isModerator) return;

    try {
      const response = await fetch(`/api/recipe/bookmark?recipeId=${recipeId}`);
      if (response.ok) {
        const json = await response.json();

        const rawCookbooks = Array.isArray(json?.data?.userCookbooks) ? json.data.userCookbooks : [];
        const cookbooks: CookbookWithBookmark[] = rawCookbooks.map((cb : any)=> ({
          ...cb,
          isBookmarked: Boolean(cb?.isBookmarked)
        }));

        setUserCookbooks(cookbooks);
        const hasBookmarks = cookbooks.some((cb) => cb.isBookmarked);
        setIsBookmarked(hasBookmarks);
      } else {
        setUserCookbooks([]);
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error('Greška pri dobijanju bookmark podataka:', error);
      setUserCookbooks([]);
      setIsBookmarked(false);
    }
  };

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        console.log(isRecipeOwner)
        const recipeResponse = await fetch(`/api/recipe?id=${recipeId}`);
        if (!recipeResponse.ok) {
          throw new Error('Recept nije pronađen');
        }
        try {
          await fetch(`/api/recipe/view?id=${recipeId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (viewError) {
          console.error("Greška pri povećanju broja pregleda:", viewError);
        }

        const recipeData: RecipeDTO = await recipeResponse.json();
        setRecipe(recipeData);  
        setEditData({
          title: recipeData.title,
          preparation_time: recipeData.preparation_time,
          heaviness: recipeData.heaviness,
          category: recipeData.category,
          number_of_portions: recipeData.number_of_portions,
          preparationSteps: recipeData.preparationSteps,
          ingredientItems: recipeData.ingredientItems
        });
        const rating = await fetch(`/api/recipe/rate?id=${recipeId}`)
        const ratingresponse = await rating.json()
        setAverageRating(ratingresponse.averageRating);
        
        await fetchBookmarkData();
        
      } catch (err) {
        console.error("Greška u fetchRecipeData:", err);
        setError(err instanceof Error ? err.message : 'Došlo je do greške');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeData();
    }
  }, [recipeId, session]);
  //  BRISANJE RECEPTA


  const handleDeleteRecipe = async () => {
    if (!confirm('Da li ste sigurni da želite da obrišete recept? Ova akcija je nepovratna!')) {
      return;
    }

    if(!isRecipeOwner)
      return;
    try {
      const response = await fetch(`/api/recipe?id=${recipeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri brisanju recepta');
      }
      router.push('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri brisanju');
    }
  };

  // EDITOVANJE RECEPTA

  const handleEditToggle = () => {
    if(!isRecipeOwner)
      return;
    if (isEditing) {
      setEditData({
        title: recipe!.title,
        preparation_time: recipe!.preparation_time,
        heaviness: recipe!.heaviness,
        category: recipe!.category,
        number_of_portions: recipe!.number_of_portions,
        preparationSteps: recipe!.preparationSteps,
        ingredientItems: recipe!.ingredientItems
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    if (!editData || !recipe) return;

    if (!editData.title || !editData.preparation_time || !editData.heaviness || 
        !editData.category || !editData.number_of_portions) {
      setError('Sva obavezna polja moraju biti popunjena');
      return;
    }

    setSaving(true);
    try {
      const dataToSend: RecipeDTO = {
        id: recipe.id,
        title: editData.title!,
        preparation_time: editData.preparation_time!,
        heaviness: editData.heaviness as Heaviness,
        category: editData.category as Category,
        number_of_views: recipe.number_of_views,
        number_of_portions: editData.number_of_portions!,
        createdAt: new Date(recipe.createdAt),
        updatedAt: new Date(),
        chefBeginnerId: recipe.chefBeginnerId,
        
        preparationSteps: editData.preparationSteps?.map(step => ({
          id: step.id,
          stepNumber: step.stepNumber,
          description: step.description,
          recipeId: recipe.id
        })) || [],
        
        ingredientItems: editData.ingredientItems?.map(item => ({
          id: item.id,
          quantity: item.quantity,
          measurementUnit: item.measurementUnit,
          ingredientId: item.ingredientId,
          recipeId: recipe.id,
          ingredient: item.ingredient
        })) || [],
        
        equipment: recipe.equipment || [],
        ratings: recipe.ratings || [],
        comments: recipe.comments || [],
        bookmarks: recipe.bookmarks || [],
        chefBeginner: recipe.chefBeginner
      };

      const response = await fetch(`/api/recipe?id=${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const refreshResponse = await fetch(`/api/recipe?id=${recipe.id}`);
        
        if (refreshResponse.ok) {
          const updatedRecipe = await refreshResponse.json();
          setRecipe(updatedRecipe);
        }
        
        setIsEditing(false);
        alert('Recept je uspešno ažuriran!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri ažuriranju');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri ažuriranju');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof RecipeDTO, value: string | number) => {
    if (editData) {
      setEditData(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleStepChange = (index: number, field: 'description', value: string) => {
    if (editData?.preparationSteps) {
      const updatedSteps = [...editData.preparationSteps];
      if (updatedSteps[index]) {
        updatedSteps[index] = {
          ...updatedSteps[index],
          [field]: value
        };
        setEditData(prev => ({
          ...prev!,
          preparationSteps: updatedSteps
        }));
      }
    }
  };

  const handleIngredientChange = (index: number, field: 'quantity' | 'measurementUnit', value: string | number) => {
    if (editData?.ingredientItems) {
      const updatedIngredients = [...editData.ingredientItems];
      if (updatedIngredients[index]) {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          [field]: value
        };
        setEditData(prev => ({
          ...prev!,
          ingredientItems: updatedIngredients
        }));
      }
    }
  };

  const addNewStep = () => {
    if (editData) {
      const currentSteps = editData.preparationSteps || [];
      setEditData(prev => ({
        ...prev!,
        preparationSteps: [
          ...currentSteps,
          {
            id: 0,
            stepNumber: currentSteps.length + 1,
            description: '',
            recipeId: recipe?.id || 0
          }
        ]
      }));
    }
  };

  const removeStep = (index: number) => {
    if (editData?.preparationSteps && editData.preparationSteps.length > 1) {
      const updatedSteps = editData.preparationSteps.filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }));
      
      setEditData(prev => ({
        ...prev!,
        preparationSteps: updatedSteps
      }));
    }
  };

  const addNewIngredient = () => {
    if (editData) {
      const currentIngredients = editData.ingredientItems || [];
      setEditData(prev => ({
        ...prev!,
        ingredientItems: [
          ...currentIngredients,
          {
            id: 0,
            quantity: 0,
            measurementUnit: '',
            ingredientId: 0,
            recipeId: recipe?.id || 0,
            ingredient: { id: 0, name: 'Novi sastojak' }
          }
        ]
      }));
    }
  };

  const removeIngredient = (index: number) => {
    if (editData?.ingredientItems && editData.ingredientItems.length > 1) {
      const updatedIngredients = editData.ingredientItems.filter((_, i) => i !== index);
      setEditData(prev => ({
        ...prev!,
        ingredientItems: updatedIngredients
      }));
    }
  };
  
  // OCENJIVANJE RECEPTA

  const handleRating = async (rating: number) => {
  if (!session) {
    alert('Morate biti prijavljeni da biste ocenili recept');
    return;
  }
  
  try {
    const response = await fetch(`/api/recipe/rate?id=${recipeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    if (response.ok) {
      const data = await response.json(); 
      setUserRating(rating);
      setAverageRating(data.averageRating);
      alert('Uspešno ste ocenili recept!');
    } else {
      const errorData = await response.json();
      
      if (errorData.error.includes('Samo kuvari')) {
        alert('Samo kuvari mogu da ocenjuju recepte. Postanite kuvar da biste ocenjivali.');
      } else if (errorData.error.includes('sopstveni recept')) {
        alert('Ne možete oceniti sopstveni recept.');
      } else {
        alert(`Greška pri ocenjivanju: ${errorData.error}`);
      }
    }
  } catch (err) {
    console.error('Greška pri ocenjivanju:', err);
    alert('Došlo je do greške pri ocenjivanju.');
  }
};
  // KOMENTARISANJE RECEPTA

  const handleCommentSubmit = async () => {
    if (!session) {
      alert('Morate biti prijavljeni da biste komentarisali');
      setNewComment('');
      return;
    }

    if (!newComment.trim()) {
      alert('Komentar ne može biti prazan');
      setNewComment('');

      return;
    }

    if(isAdmin || isModerator){
      alert("Ne mozete komentarisati recepte");
      return;
    }
    try {
      const response = await fetch(`/api/recipe/comment?id=${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment}),
      });

      if (response.ok) {
        setNewComment('');
        const recipeResponse = await fetch(`/api/recipe?id=${recipeId}`);
        if (recipeResponse.ok) {
          const recipeData = await recipeResponse.json();
          setRecipe(recipeData);
        }
      }
    } catch (err) {
      console.error('Greška pri komentarisanju:', err);
    }
  };

  // ČUVANJE RECEPTA


  const handleBookmarkUpdate = async (cookbookIdsToAdd: number[], cookbookIdsToRemove: number[]) => {
    if (!session) {
      alert('Morate biti prijavljeni da biste sačuvali recept');
      return;
    }

    if (isAdmin || isModerator) {
      alert("Ne možete čuvati recepte");
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await fetch('/api/recipe/bookmark', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: parseInt(recipeId),
          cookbookIdsToAdd,
          cookbookIdsToRemove,
          title: recipe?.title || `Bookmark za ${recipe?.title}`
        }),
      });

      if (response.ok) {
        await fetchBookmarkData();
        setShowBookmarkDropdown(false);
      } else {
        const errorData = await response.json();
        console.error('Greška sa servera:', errorData.error);
        alert('Došlo je do greške pri ažuriranju bookmarkova');
      }
    } catch (err) {
      console.error('Greška pri ažuriranju bookmarkova:', err);
      alert('Došlo je do greške pri ažuriranju bookmarkova');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleAddToCookbook = async (cookbookId: number) => {
    await handleBookmarkUpdate([cookbookId], []);
  };

  const handleRemoveFromCookbook = async (cookbookId: number) => {
    await handleBookmarkUpdate([], [cookbookId]);
  };

  const handleBookmarkClick = () => {
    if (!session) {
      alert('Morate biti prijavljeni da biste sačuvali recept');
      return;
    }

    if (isAdmin || isModerator) {
      alert("Ne možete čuvati recepte");
      return;
    }

    setShowBookmarkDropdown(!showBookmarkDropdown);
  };

  
 // FORMATIRANJE  

  const formatCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'BREAKFAST': "Doručak",
      'LUNCH': "Ručak",
      'DINNER': "Večera",
      'SNACK': "Užina",
      'DESSERT': "Desert",
      'DRINK': "Piće"
    };
    return categoryMap[category] || category;
  };

  const formatHeaviness = (heaviness: string) => {
    const heavinessMap: Record<string, string> = {
      'LIGHT': "Lako",
      'MEDIUM': "Srednje",
      'HEAVY': "Teško"
    };
    return heavinessMap[heaviness] || heaviness;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje recepta...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <strong className="font-bold">Greška! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              Recept nije pronađen
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex md:flex-row flex-col items-center justify-between md:items-start gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex-4">
            
            <div className="flex flex-col md:flex-row gap-6 p-6 border-b border-gray-100">
              <div className="w-full md:w-1/3 h-64 bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50">
                  {/* <Utensils size={64} className="text-gray-400" /> */}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    {isEditing && isRecipeOwner ? (
                      <input
                        type="text"
                        value={editData?.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
                    )}
                    
                    {
                      !isAdmin && !isModerator && !isSponsor && !isRecipeOwner && (
                        <div className="flex gap-2 relative">
                          <button 
                            onClick={handleBookmarkClick}
                            className={`p-2 rounded-full shadow-md ${
                              isBookmarked 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Bookmark 
                              size={20} 
                              className={isBookmarked ? 'fill-current' : ''} 
                            />
                          </button>
                          
                          {showBookmarkDropdown && (
                            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
                              <div className="p-3 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Sačuvaj u cookbook</h3>
                                <p className="text-sm text-gray-600 mt-1">Izaberite cookbook</p>
                              </div>
                              
                              <div className="max-h-60 overflow-y-auto">
                                {userCookbooks.length > 0 ? (
                                  userCookbooks.map((cookbook) => (
                                    <div
                                      key={cookbook.id}
                                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                                        cookbook.isBookmarked ? 'bg-blue-50' : ''
                                      }`}
                                      onClick={() => 
                                        cookbook.isBookmarked 
                                          ? handleRemoveFromCookbook(cookbook.id)
                                          : handleAddToCookbook(cookbook.id)
                                      }
                                    >
                                      <div className="flex items-center">
                                        <Bookmark 
                                          size={16} 
                                          className={`mr-2 ${
                                            cookbook.isBookmarked 
                                              ? 'text-yellow-500 fill-current' 
                                              : 'text-gray-400'
                                          }`} 
                                        />
                                        <span className={cookbook.isBookmarked ? 'font-medium' : ''}>
                                          {cookbook.title}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {cookbook.isBookmarked ? 'Sačuvano' : 'Dodaj'}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500">
                                    Nema cookbookova. <span><Link href={`/user/${sessionUserId}/cookbook`} className='underline text-blue-600'>Kreirajte prvi cookbook!</Link></span>
                                  </div>
                                )}
                              </div>
                              
                              {bookmarkLoading && (
                                <div className="p-3 border-t border-gray-100 bg-gray-50">
                                  <div className="flex items-center justify-center text-sm text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    Ažuriranje...
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }

                    {
                      (isAdmin || isModerator || isRecipeOwner) && (
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="p-2 bg-green-100 rounded-full shadow-md hover:bg-green-200 disabled:opacity-50"
                                title="Sačuvaj izmene"
                              >
                                <Save size={20} className="text-green-600" />
                              </button>
                              <button 
                                onClick={handleEditToggle}
                                disabled={saving}
                                className="p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200"
                                title="Otkaži"
                              >
                                <X size={20} className="text-gray-600" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={handleEditToggle}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50"
                                title="Uredi recept"
                              >
                                <Edit size={20} className="text-blue-600" />
                              </button>
                              <button 
                                onClick={handleDeleteRecipe}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                                title="Obriši recept"
                              >
                                <Trash2 size={20} className="text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      )
                    }
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-yellow-500 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={star <= Math.round(averageRating) ? "fill-current" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {averageRating.toFixed(1)} ({recipe.ratings?.length || 0} {recipe.ratings?.length === 1 ? 'ocena' : 'ocena'})
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <ChefIcon size={18} className="mr-2" />
                    <Link href={`/user/${recipe.chefBeginner?.userId}`}>
                      <span className="font-medium underline">
                        {recipe.chefBeginner?.user?.first_name} {recipe.chefBeginner?.user?.last_name}
                      </span>
                    </Link>
                    {recipe.chefBeginner?.privileged_user && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Premium kuvar
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-500 mr-2" />
                    {isEditing && isRecipeOwner? (
                      <input
                        type="number"
                        value={editData?.preparation_time || 0}
                        onChange={(e) => handleInputChange('preparation_time', parseInt(e.target.value))}
                        className="w-20 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span>{recipe.preparation_time} min</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Users size={18} className="text-gray-500 mr-2" />
                    {isEditing && isRecipeOwner ? (
                      <input
                        type="number"
                        value={editData?.number_of_portions || 0}
                        onChange={(e) => handleInputChange('number_of_portions', parseInt(e.target.value))}
                        className="w-20 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span>{recipe.number_of_portions} porcija</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <ChefHat size={18} className="text-gray-500 mr-2" />
                    {isEditing && isRecipeOwner ? (
                      <select
                        value={editData?.heaviness || ''}
                        onChange={(e) => handleInputChange('heaviness', e.target.value)}
                        className="bg-gray-50 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="LIGHT">Lako</option>
                        <option value="MEDIUM">Srednje</option>
                        <option value="HEAVY">Teško</option>
                      </select>
                    ) : (
                      <span className="capitalize">{formatHeaviness(recipe.heaviness)}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Eye size={18} className="text-gray-500 mr-2" />
                    <span>{recipe.number_of_views} pregleda</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <select
                    value={editData?.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full border-none"
                  >
                    <option value="BREAKFAST">Doručak</option>
                    <option value="LUNCH">Ručak</option>
                    <option value="DINNER">Večera</option>
                    <option value="SNACK">Užina</option>
                    <option value="DESSERT">Desert</option>
                    <option value="DRINK">Piće</option>
                  </select>
                ) : (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {formatCategory(recipe.category)}
                  </span>
                )}
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                  {formatHeaviness(recipe.heaviness)}
                </span>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Sastojci
                </h2>
                {isEditing && (
                  <button
                    onClick={addNewIngredient}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    + Dodaj sastojak
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {editData?.ingredientItems?.map((item, index) => (
                  <li key={index} className="flex items-center py-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleIngredientChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-16 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={item.measurementUnit}
                          onChange={(e) => handleIngredientChange(index, 'measurementUnit', e.target.value)}
                          className="w-20 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                          placeholder="jedinica"
                        />
                        <span className="text-gray-700">{item.ingredient?.name}</span>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {item.quantity} {item.measurementUnit} {item.ingredient?.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {recipe.equipment && recipe.equipment.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Potrebna oprema
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {recipe.equipment.map((item, index) => (
                    <li key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {item.equipment?.name || 'Nepoznata oprema'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  Priprema
                </h2>
                {isEditing && (
                  <button
                    onClick={addNewStep}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    + Dodaj korak
                  </button>
                )}
              </div>
              <ol className="space-y-4">
                {editData?.preparationSteps && editData.preparationSteps.length > 0 && (
                  <ol className="space-y-4">
                    {editData.preparationSteps.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-4 font-medium">
                          {step.stepNumber}
                        </span>
                        {isEditing ? (
                          <div className="flex-1 flex items-start gap-2">
                            <textarea
                              value={step.description}
                              onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                              className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2"
                              rows={2}
                            />
                            <button
                              onClick={() => removeStep(index)}
                              className="text-red-500 hover:text-red-700 mt-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-700 pt-1">{step.description}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </ol>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Komentari i ocene ({(recipe.comments?.length || 0)})
              </h2>
              
              {session && !isAdmin && !isModerator && !isSponsor ? (
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-3">Ocenite i komentarišite</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaša ocena</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button"
                          onClick={() => handleRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            size={24} 
                            className={star <= userRating ? "text-yellow-500 fill-current" : "text-gray-300"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Vaš komentar
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Podelite svoje iskustvo sa ovim receptom..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Pošalji komentar
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg mb-6 text-center">
                  <p className="text-gray-600">
                    <a href="" className="text-blue-600 hover:underline">Prijavite se</a> kao korisnik da biste ocenili i komentarisali recept.
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                {(recipe.comments && recipe.comments.length > 0) ? (
                  recipe.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-800 font-medium">
                            {comment.chefBeginner?.user?.first_name?.[0]}{comment.chefBeginner?.user?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {comment.chefBeginner?.user?.first_name} {comment.chefBeginner?.user?.last_name}
                          </div>
                          {comment.rating && (
                            <div className="flex items-center text-yellow-500 text-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  className={star <= 10 ? "fill-current" : "text-gray-300"} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-auto text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Trenutno nema komentara za ovaj recept.
                  </div>
                )}
              </div>
            </div>
          
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>Kreiran: {new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span>Ažuriran: {new Date(recipe.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {!isPremium && (<div className='h-[400px] md:h-[650px] flex-1 max-w-xs w-xs'>
            <Advertisment />
          </div>)}
        </div>
      </div>
    </>
  );
}