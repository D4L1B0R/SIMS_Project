'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CookbookDTO, BookmarkDTO, RecipeDTO, ChefBeginnerDTO, UserDTO } from '@/lib/dtos';
import Navbar from '@/components/Navbar';
import { Plus, Trash2 } from 'lucide-react';
import CookbookCard from '@/components/CookbookCard';
import CreateCookbookModal from '@/components/CreateCookbookModal';

export default function UserCookbooksPage() {
  const params = useParams();
  const router = useRouter();
  
  const userId = params.userId ? parseInt(params.userId as string) : NaN;  
  const [cookbooks, setCookbooks] = useState<CookbookDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCookbook, setNewCookbook] = useState({ title: '', description: '' });

  useEffect(() => {
    
    if (params.userId && !isNaN(userId)) {
      fetchCookbooks();
    } else {
      setError(`Nevalidan ID korisnika: ${params.userId}`);
      setLoading(false);
    }
  }, [params.userId, userId]);

  const fetchCookbooks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isNaN(userId)) {
        setError('Nevalidan ID korisnika');
        return;
      }
      const response = await fetch(`/api/user/${userId}/cookbook`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCookbooks(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load cookbooks');
      }
    } catch (err) {
      console.error('Error fetching cookbooks:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(userId)) {
      setError('Nevalidan ID korisnika');
      return;
    }
    
    try {
      const response = await fetch(`/api/user/${userId}/cookbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCookbook),
      });

      if (!response.ok) {
        throw new Error('Failed to create cookbook');
      }

      const data = await response.json();
      if (data.success) {
        setCookbooks(prev => [...prev, data.data]);
        setShowCreateModal(false);
        setNewCookbook({ title: '', description: '' });
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cookbook');
    }
  };

  const handleDeleteCookbook = async (cookbookId: number) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj cookbook?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/cookbook/${cookbookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cookbook');
      }

      setCookbooks(prev => prev.filter(cb => cb.id !== cookbookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete cookbook');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar></Navbar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">
            Učitavanje knjiga recepata...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
      <Navbar></Navbar>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <div className="text-red-500 text-lg">Greška: {error}</div>
          <button 
            onClick={fetchCookbooks}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Pokušaj ponovo
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex md:flex-row flex-col items-center justify-between md:items-start gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-6 pt-6">
              <div className=''>
                <h1 className="text-3xl font-bold text-left md:text-center text-gray-900 mb-4">Moje knjige recepata</h1>
              </div>
              
              {cookbooks.length >0 && ( 
              <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 md:mt-0 md:ml-4 flex items-center justify-center h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md mx-auto md:mx-0 flex-shrink-0"
                title="Dodaj novu knjigu recepata"
              >
                <Plus className="h-6 w-6" />
              </button>)}
            </div>

            {cookbooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  <p className="text-gray-600 mb-2">Trenutno nema knjiga recepata.</p>
                  <p className="text-gray-500 text-sm">Kliknite na + da kreirate svoju prvu knjigu recepata.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mb-6 flex items-center justify-center h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md mx-auto flex-shrink-0"
                  title="Kreiraj prvu knjigu recepata"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="grid px-4 pb-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cookbooks.map((cookbook) => (
                  <CookbookCard
                    key={cookbook.id}
                    cookbook={cookbook}
                    userId={userId}
                    onDelete={handleDeleteCookbook}
                  />
                ))}
              </div>
            )}

            {showCreateModal && (
              <CreateCookbookModal
                newCookbook={newCookbook}
                setNewCookbook={setNewCookbook}
                setShowCreateModal={setShowCreateModal}
                handleCreateCookbook={handleCreateCookbook}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
