'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdDTO, SessionUser } from '@/lib/dtos';
import Navbar from '@/components/Navbar';
import Statistics from '@/components/Statistics';
import AdCard from '@/components/AdCard';
import AdModal from '@/components/AdModal';
import PromoteChefModal from '@/components/PromoteChefModal';

const SponsorPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function NavbarWithSuspense() {
  return (
    <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
      <Navbar />
    </Suspense>
  );
}

function SponsorPageContent() {
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsorId, setSponsorId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [revenueFactor, setRevenueFactor] = useState<number>(0.1); 
  const [promoteLoading, setPromoteLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const user = session.user as SessionUser;
      if (user.isSponsor) {
        setSponsorId(parseInt(user.id));
      }
      fetchAds();
      fetchAggregatedStats();
    }
  }, [session, refreshTrigger]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ad');
      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }
      const userAds = await response.json();
      setAds(userAds);
      setError(null);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('Došlo je do greške pri učitavanju reklama');
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregatedStats = async () => {
    try {
      const response = await fetch('/api/ad/stats');
      if (response.ok) {
        const stats = await response.json();
        setAggregatedStats(stats);
        if (stats.revenueFactor) {
          setRevenueFactor(stats.revenueFactor);
        }
      }
    } catch (err) {
      console.error('Error fetching aggregated stats:', err);
    }
  };

  const refreshAds = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateAd = () => {
    setEditingAd(null);
    setIsModalOpen(true);
  };

  const handleEditAd = (ad: AdDTO) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu reklamu?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ad/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }
      
      refreshAds();
      setError(null);
    } catch (err) {
      console.error('Error deleting ad:', err);
      setError('Došlo je do greške pri brisanju reklame');
    }
  };

  const handleSaveAd = async (adData: Partial<AdDTO>) => {
    try {
      if (editingAd && editingAd.id) {
        const updateData = {
          id: editingAd.id,
          resource_url: adData.resource_url || '',
          description: adData.description || '',
          sponsorId: editingAd.sponsorId,
          adStatsId: editingAd.adStatsId,
          adStats: {
            id: editingAd.adStats?.id,
            ad_costs: adData.adStats?.ad_costs || 0,
            number_of_views: editingAd.adStats?.number_of_views || 0,
            revenue: 0, 
            sponsorId: editingAd.sponsorId
          }
        };
        
        const response = await fetch(`/api/ad/${editingAd.id}`, { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update ad');
        }
      } else {
        const user = session?.user as SessionUser;
        const sponsorId = parseInt(user.id);
        
        const newAdData = {
          resource_url: adData.resource_url || '',
          description: adData.description || '',
          sponsorId: sponsorId,
          adStats: {
            ad_costs: adData.adStats?.ad_costs || 0,
            number_of_views: 0, 
            revenue: 0, 
            sponsorId: sponsorId
          }
        };
        
        const response = await fetch('/api/ad', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAdData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create ad');
        }
      }
      
      refreshAds();
      setIsModalOpen(false);
      setEditingAd(null);
      setError(null); 
    } catch (err: any) {
      console.error('Error saving ad:', err);
      setError(`Došlo je do greške pri čuvanju reklame: ${err.message}`);
    }
  };

  const handlePromoteChef = async (chefId: number, chefName: string) => {
    try {
      setPromoteLoading(true);
      
      // Prvo dobavi trenutne podatke o kuvaru
      const userResponse = await fetch(`/api/user?id=${chefId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch chef data');
      }
      
      const userData = await userResponse.json();
      
      // Ažuriraj podatke sa postavljanjem privileged_user na true
      const updateData = {
        ...userData,
        chefBeginner: {
          ...userData.chefBeginner,
          privileged_user: true
        }
      };
      
      const response = await fetch(`/api/user?id=${chefId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to promote chef');
      }
      
      alert(`Uspešno ste promovisali kuvara ${chefName}!`);
      setIsPromoteModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Error promoting chef:', err);
      setError(`Došlo je do greške pri promociji kuvara: ${err.message}`);
    } finally {
      setPromoteLoading(false);
    }
  };

  const displayStats = aggregatedStats || {
    totalCosts: ads.reduce((sum, ad) => sum + (ad.adStats?.ad_costs || 0), 0),
    totalRevenue: ads.reduce((sum, ad) => sum + ((ad.adStats?.number_of_views || 0) * revenueFactor), 0),
    totalViews: ads.reduce((sum, ad) => sum + (ad.adStats?.number_of_views || 0), 0)
  };

  if (status === 'loading' || loading) {
    return <SponsorPageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarWithSuspense />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Upravljanje Reklamama</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <Statistics stats={displayStats} revenueFactor={revenueFactor} />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Moje reklame</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPromoteModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Promoviši kuvara
            </button>
            <button
              onClick={handleCreateAd}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova reklama
            </button>
          </div>
        </div>
        
        {ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nemate nijednu reklamu</h3>
            <p className="text-gray-500">Kreirajte svoju prvu reklamu da biste počeli sa promocijom.</p>
            <button
              onClick={handleCreateAd}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Kreiraj prvu reklamu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, index) => (
              <AdCard
                key={ad.id ? `ad-${ad.id}` : `temp-ad-${index}`}
                ad={ad}
                onEdit={handleEditAd}
                onDelete={handleDeleteAd}
                revenueFactor={revenueFactor}
              />
            ))}
          </div>
        )}
        
        <AdModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAd(null);
          }}
          onSave={handleSaveAd}
          sponsorId={sponsorId!}
          editingAd={editingAd}
        />
        
        <PromoteChefModal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          onPromote={handlePromoteChef}
        />
      </div>
    </div>
  );
}

export default function SponsorPage() {
  return (
    <Suspense fallback={<SponsorPageLoading />}>
      <SponsorPageContent />
    </Suspense>
  );
}