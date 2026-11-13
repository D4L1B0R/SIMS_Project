'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CookbookDTO,BookmarkDTO, RecipeDTO, ChefBeginnerDTO, UserDTO } from '@/lib/dtos';
import Navbar from '@/components/Navbar';
import BookmarkCard from '@/components/BookmarkCard';

export default function CookbookDetailPage() {
  const params = useParams();
  const router = useRouter();

  
  const userId = params.userId ? parseInt(params.userId as string) : NaN;  
  const cookbookId = params.cookbookId ? parseInt(params.cookbookId as string): NaN;
  const [cookbook, setCookbook] = useState<CookbookDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [newBookmark, setNewBookmark] = useState({ recipeId: '', title: '' });

  useEffect(() => {
    
    if (params.userId && params.cookbookId && !isNaN(userId) && !isNaN(cookbookId)) {
      fetchCookbook();
    }
    else{
      setError("Nevalidan ID cookbooka ili korisnika")
      setLoading(false);
    }
  }, [params.userId, params.cookbookId, userId ,cookbookId]);

  const fetchCookbook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cookbook');
      }
      
      const data = await response.json();
      if (data.success) {
        setCookbook(data.data);
        setEditData({
          title: data.data.title,
          description: data.data.description || ''
        });
      } else {
        throw new Error(data.error || 'Failed to load cookbook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update cookbook');
      }

      const data = await response.json();
      if (data.success) {
        setCookbook(prev => prev ? { ...prev, ...editData } : null);
        setShowEditModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cookbook');
    }
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: parseInt(newBookmark.recipeId),
          title: newBookmark.title
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add bookmark');
      }

      await fetchCookbook(); 
      setShowAddBookmarkModal(false);
      setNewBookmark({ recipeId: '', title: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj bookmark?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}/bookmark/${bookmarkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bookmark');
      }

      await fetchCookbook(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
    }
  };

  const handleUpdateBookmark = async (bookmarkId: number, newTitle: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}/bookmark/${bookmarkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      setCookbook(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          bookmarks: prev.bookmarks?.map(bookmark => 
            bookmark.id === bookmarkId 
              ? { ...bookmark, title: newTitle }
              : bookmark
          ) || []
        };
      });
      
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Učitavanje cookbooka...</div>
        </div>
      </>
    );
  }

  if (error || !cookbook) {
    return (
      <>
        <Navbar></Navbar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 text-lg">
            {error || 'Cookbook nije pronađen'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{cookbook.title}</h1>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Izmeni cookbook"
                >
                  ✏️
                </button>
              </div>
              
              {cookbook.description && (
                <p className="text-gray-600 text-lg">{cookbook.description}</p>
              )}
              
              <div className="text-gray-500 text-sm mt-2">
                {cookbook.bookmarks?.length || 0} recepta u cookbooku
              </div>
            </div>
            
            <button
              onClick={() => setShowAddBookmarkModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              <span>Dodaj recept</span>
            </button>
          </div>

          <div className="space-y-4">
            {cookbook.bookmarks && cookbook.bookmarks.length > 0 ? (
              cookbook.bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  userId={userId}
                  cookbookId={cookbookId}
                  onDelete={handleDeleteBookmark}
                  onUpdate={handleUpdateBookmark}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                Još uvek nema recepata u ovom cookbooku
              </div>
            )}
          </div>

          {showEditModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Izmeni cookbook</h2>
                
                <form onSubmit={handleUpdateCookbook}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Naziv cookbooka
                      </label>
                      <input
                        type="text"
                        required
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opis
                      </label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sačuvaj
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Otkaži
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddBookmarkModal && (
            <div className="fixed inset-0 bg-black/30 backdrop:blur-2xl flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Dodaj recept u cookbook</h2>
                
                <form onSubmit={handleAddBookmark}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID recepta *
                      </label>
                      <input
                        type="number"
                        required
                        value={newBookmark.recipeId}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, recipeId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unesite ID recepta"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Naziv bookmarka (opciono)
                      </label>
                      <input
                        type="text"
                        value={newBookmark.title}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unesite naziv bookmarka"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Dodaj
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddBookmarkModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Otkaži
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
