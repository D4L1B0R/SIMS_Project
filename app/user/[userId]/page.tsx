'use client';

import CreateRecipeModal from '@/components/CreateRecipeModal';
import Navbar from '@/components/Navbar';
import SmallRecipeCard from '@/components/SmallRecipeCard';
import { Plus, ChefHat, Edit, Heart, Trash2, Save, X, Crown, User, Bookmark } from 'lucide-react';
import { getSession, useSession } from 'next-auth/react';
import { useParams} from 'next/navigation';
import { useEffect, useState } from 'react';
import { RecipeDTO, SessionUser, UserDTO, ChefBeginnerDTO} from '@/lib/dtos';
import Advertisment from '@/components/Advertisment';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';

export default function Page() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState<UserDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    is_privileged: false
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPrivilegedStatus, setPendingPrivilegedStatus] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const sessionUserId = (session?.user as SessionUser)?.id;
  const isPremium = (session?.user as SessionUser)?.privileged_user;
  const isCurrentUser = Boolean(
    sessionUserId && userId && sessionUserId.toString() === userId.toString()
  );

  const isAdmin = (session?.user as SessionUser)?.isAdmin || false;
  const isModerator = (session?.user as SessionUser)?.isModerator || false;

  const canEdit = isCurrentUser || isAdmin;

  const fetchUserRecipes = async () => {
    try {
      const response = await fetch(`/api/user/recipe?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Greška pri učitavanju recepata korisnika');
      }
      
      const recipesData = await response.json();
      setRecipes(recipesData);
    } catch (err) {
      console.error('Greška na ruti api/user/recipe', err);
      setRecipes([]);
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await fetch(`/api/user?id=${userId}`);
        
        if (!userResponse.ok) {
          throw new Error('Korisnik nije pronađen');
        }
        
        const userData = await userResponse.json();
        setUser(userData);

        await fetchUserRecipes();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Došlo je do greške');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_privileged: user.chefBeginner?.privileged_user || false
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditData({
        first_name: user.first_name,
        last_name: user.last_name,
        is_privileged: user.chefBeginner?.privileged_user || false
      });
    }
  };
const handleSubscriptionChange = (newPrivilegedStatus: boolean) => {
  const currentStatus = user?.chefBeginner?.privileged_user || false;
  
  
  if (newPrivilegedStatus && !currentStatus) {
    setPendingPrivilegedStatus(true);
    setShowPaymentModal(true);
  } else {
    handleSaveEditWithPrivileged(newPrivilegedStatus);
  }
};

const handlePaymentConfirm = async (paymentData: any) => {
  try {
    setPaymentLoading(true);
    
    setShowPaymentModal(false);
    
    await handleSaveEditWithPrivileged(true);
    
    setPaymentLoading(false);
      
  } catch (err) {
    setError('Došlo je do greške pri obradi plaćanja');
    setPaymentLoading(false);
  }
};

const handleSaveEditWithPrivileged = async (privilegedStatus: boolean) => {
  try {
    if (!user) {
      throw new Error('Korisnik nije pronađen');
    }
    if (!canEdit) {
      alert("Vi ne možete menjati ovog korisnika");
      return;
    }
    
    const updateData = {
      id: user.id,
      gender: user.gender,
      first_name: editData.first_name, 
      last_name: editData.last_name,   
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      chefBeginner: user.chefBeginner ? {
        ...user.chefBeginner,
        privileged_user: privilegedStatus
      } : undefined,
      sponsor: user.sponsor,
      moderator: user.moderator
    };

    const response = await fetch(`/api/user?id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Greška pri ažuriranju podataka');
    }

    const result = await response.json();
    
    if (result.message === "User uspešno ažuriran") {
      const updatedChefBeginner: ChefBeginnerDTO = {
        id: user.chefBeginner?.id || 0, 
        privileged_user: privilegedStatus,
        userId: user.id || 0,
        user: user,
        recipes: user.chefBeginner?.recipes || [],
        comments: user.chefBeginner?.comments || [],
        ratings: user.chefBeginner?.ratings || [],
        cookbooks: user.chefBeginner?.cookbooks || []
      };
      
      const updatedUser: UserDTO = {
        ...user,
        first_name: editData.first_name,
        last_name: editData.last_name,
        chefBeginner: updatedChefBeginner
      };
      
      setUser(updatedUser);
      setIsEditing(false);
      setError(null);
      
      setEditData(prev => ({
        ...prev,
        is_privileged: privilegedStatus
      }));
      const refreshResponse = await fetch(`/api/user?id=${userId}`);
      if (refreshResponse.ok) {
        const refreshedUser = await refreshResponse.json();
        setUser(refreshedUser);
        
        setEditData({
          first_name: refreshedUser.first_name,
          last_name: refreshedUser.last_name,
          is_privileged: refreshedUser.chefBeginner?.privileged_user || false
        });
      }
      if (isCurrentUser) {
        const updatedSession = await getSession();
      }
    } else {
      throw new Error('Neočekivani odgovor od servera');
    }
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Došlo je do greške pri ažuriranju korisnika');
  }
};

const handleSaveEdit = async () => {
  await handleSaveEditWithPrivileged(editData.is_privileged);
};
  const handleDeleteUser = async () => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj nalog? Ova akcija je nepovratna!')) {
      return;
    }
    
    if (!canEdit) {
      alert("Vi ne možete izbrisati ovog korisnika");
      return;
    }
    
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri brisanju naloga');
      }

      localStorage.clear();
      sessionStorage.clear();
      
      window.location.href = '/';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri brisanju');
    }
  };

  if (loading || status =="loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje podataka o korisniku...</p>
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex md:flex-row flex-col items-center justify-between md:items-start gap-6">
          <div className="flex-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-8">
              
              <div className="flex md:flex-row flex-col items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-40 w-40 rounded-full flex items-center justify-center shadow-inner">
                    <ChefHat className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    {isEditing && canEdit ? (
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <input
                          type="text"
                          value={editData.first_name}
                          onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                          className="text-2xl font-bold text-gray-800 border border-gray-300 rounded px-2 py-1"
                          placeholder="Ime"
                        />
                        <input
                          type="text"
                          value={editData.last_name}
                          onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                          className="text-2xl font-bold text-gray-800 border border-gray-300 rounded px-2 py-1"
                          placeholder="Prezime"
                        />
                      </div>
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
                        {user?.first_name} {user?.last_name}
                      </h1>
                    )}
                    
                    <div className="flex items-center justify-center md:justify-end space-x-3 mt-2 md:mt-0">
                      {canEdit && (
                        <>
                          {isEditing ? (
                            <>
                              <button 
                                onClick={handleSaveEdit}
                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                                title="Sačuvaj promene"
                              >
                                <Save className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="p-2 text-gray-600 hover:text-gray-700 transition-colors"
                                title="Otkaži"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={handleEdit}
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Izmeni profil"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={handleDeleteUser}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                title="Obriši nalog"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      
                    </div>
                  </div>
                  
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      {isEditing && canEdit ? (
                        <select
                          value={editData.is_privileged ? "premium" : "obican"}
                          onChange={(e) => handleSubscriptionChange(e.target.value === "premium")}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="obican">Običan korisnik</option>
                          <option value="premium">Premium korisnik</option>
                        </select>
                      ) : (
                        <>
                          <div className='flex flex-row  gap-5'>
                            
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              user?.chefBeginner?.privileged_user 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user?.chefBeginner?.privileged_user ? (
                                <>
                                  <Crown className="h-4 w-4 mr-1" />
                                  <span>Premium korisnik</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 mr-1" />
                                  <span>Običan korisnik</span>
                                </>
                              )}
                            </div>
                            {(isAdmin || isModerator || isCurrentUser) && (
                              <>
                                <Link href={`/user/${userId}/cookbook`} className='flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800'>

                                    <Bookmark className="h-4 w-4 mr-1" />
                                    <span>Sačuvane knjige recepata</span>
                                </Link>
                              </>
                            )}
                            
                          </div>
                        </>
                      )}
                    </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Moji recepti</h2>
                
                {recipes.length > 0 ? (
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="flex-1 md:overflow-x-auto md:pb-4 mx-auto">
                    <div className="grid grid-cols-1 md:flex md:space-x-4 md:flex-nowrap gap-4 md:gap-0">
                      {recipes.map((recipe) => (
                        <SmallRecipeCard 
                          key={recipe.id}
                          id={recipe.id}
                          title={recipe.title}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {(!isAdmin && isCurrentUser) && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 md:mt-0 md:ml-4 flex items-center justify-center h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md mx-auto md:mx-0 flex-shrink-0"
                      title="Dodaj novi recept"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  {(!isAdmin && isCurrentUser) ? (
                    <>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="mb-6 flex items-center justify-center h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md mx-auto flex-shrink-0"
                        title="Kreiraj prvi recept"
                      >
                        <Plus className="h-6 w-6" />
                      </button>
                      <p className="text-gray-600 mb-2">Trenutno nema recepata.</p>
                      <p className="text-gray-500 text-sm">Kliknite na + da kreirate svoj prvi recept!</p>
                    </>
                  ):(
                    <p className="text-gray-500">Korisnik još uvek nema recepata.</p>
                  )}
                </div>
              )}
              </div>  
            </div>
          </div>
          
          {!isPremium && (<div className='h-[400px] md:h-[650px] flex-1 max-w-xs w-xs'>
            <Advertisment />
          </div>)}
        </div>
      </div>
      
      {canEdit && (
        <CreateRecipeModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onRecipeCreated={fetchUserRecipes}
        />
      )}

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditData(prev => ({
            ...prev,
            is_privileged: user?.chefBeginner?.privileged_user || false
          }));
        }}
        onConfirm={handlePaymentConfirm}
        isLoading={paymentLoading}
      />
    </>
  );
}