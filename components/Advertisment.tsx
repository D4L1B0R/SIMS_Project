'use client';

import { useState, useEffect } from 'react';
import { AdDTO } from '@/lib/dtos';
import Link from 'next/link';

interface Ad {
  id: number;
  title: string;
  description: string;
  image: string;
  sponsor: string;
  ctaText: string;
  ctaLink: string;
  hasValidImage: boolean;
}

export default function Advertisement() {
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const fixImageUrl = (url: string): string => {
    if (!url || url.trim() === '') {
      return '';
    }
    
    if (url.startsWith('https:') && !url.startsWith('https://')) {
      return url.replace('https:', 'https://');
    }
    
    if (url.startsWith('http:') && !url.startsWith('http://')) {
      return url.replace('http:', 'http://');
    }
    
    return url;
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ad');
        if (!response.ok) {
          throw new Error('Failed to fetch ads');
        }
        const adsData = await response.json();
        setAds(adsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Došlo je do greške pri učitavanju reklama');
        setAds(getMockAds());
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;

    const incrementView = async () => {
      try {
        const currentAd = ads[currentAdIndex];
        if (currentAd?.id) {
          await fetch(`/api/ad/${currentAd.id}/increment-views`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }
      } catch (err) {
        console.error('Error incrementing ad view:', err);
      }
    };

    incrementView();
  }, [currentAdIndex, ads]);

  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const transformAd = (ad: AdDTO): Ad => {
    const originalImageUrl = ad.resource_url || '';
    const fixedImageUrl = fixImageUrl(originalImageUrl);
    const hasValidImage = isValidUrl(fixedImageUrl) && fixedImageUrl !== '';

    return {
      id: ad.id || 0,
      title: ad.description?.substring(0, 50) + (ad.description && ad.description.length > 50 ? '...' : '') || 'Reklama',
      description: ad.description || 'Bez opisa',
      image: hasValidImage ? fixedImageUrl : '',
      sponsor: ad.sponsor?.company_name || ad.sponsor?.user?.first_name + ' ' + ad.sponsor?.user?.last_name || 'Sponzor',
      ctaText: 'Saznaj više',
      ctaLink: `#ad-${ad.id}`,
      hasValidImage
    };
  };

  const getMockAds = (): AdDTO[] => {
    return [
      {
        id: 1,
        resource_url: 'https://via.placeholder.com/300x250',
        description: "Premium Kuvarski Pribor - Uživajte u kuvanju sa našim premium setovima noževa i pribora za kuvanje",
        sponsorId: 1,
        adStatsId: 1,
        sponsor: {
          id: 1,
          userId: 1,
          pib: '123456789',
          company_name: 'ChefTools',
          user: {
            id: 1,
            gender: 'MALE',
            first_name: 'Marko',
            last_name: 'Petrović',
            phone_number: '0611234567',
            date_of_birth: new Date('1980-01-01'),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        adStats: {
          id: 1,
          ad_costs: 1000,
          number_of_views: 150,
          revenue: 2000,
          sponsorId: 1
        }
      }
    ] as AdDTO[];
  };
  const handleAdClick = async () => {
    try {
      if (ads[currentAdIndex].id) {
        await fetch(`/api/ad/${ads[currentAdIndex].id}/increment-views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
      
      if (currentAd.ctaLink && currentAd.ctaLink !== '#') {
        window.open(currentAd.ctaLink, '_blank');
      }
    } catch (err) {
      console.error('Error tracking ad click:', err);
    }
  };

  if (loading) {
    return (
      <div className="md:w-full md:h-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || ads.length === 0) {
    return (
      <div className="md:w-full md:h-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <span className="text-2xl">📺</span>
            <p className="text-sm mt-2">Trenutno nema dostupnih reklama</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAd = transformAd(ads[currentAdIndex]);

  return (
    <Link href={`/ad/${currentAd.id}`}>
    <div className="md:w-full md:h-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="lg:hidden p-4">
          <div className="bg-gray-100 rounded-lg p-3 mb-3 text-center">
            <h3 className="font-semibold text-blue-600 mb-1">SPONZORISANO</h3>
            <p className="text-xs text-gray-500">by {currentAd.sponsor}</p>
          </div>
          
          <div className="relative h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {currentAd.hasValidImage ? (
              <img 
                src={currentAd.image} 
                alt={currentAd.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            
            <div className={`absolute inset-0 flex items-center justify-center ${currentAd.hasValidImage ? 'hidden' : ''}`}>
              <div className="text-center">
                <span className="text-gray-500 text-2xl">📷</span>
                <p className="text-sm text-gray-600 mt-1">Reklama</p>
                <p className="text-xs text-gray-500 mt-1">{currentAd.sponsor}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-bold text-lg mb-1">{currentAd.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{currentAd.description}</p>
            <button 
              onClick={handleAdClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              {currentAd.ctaText}
            </button>
          </div>

          <div className="flex justify-center mt-3 space-x-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentAdIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col w-full h-full">
          <div className="bg-gray-100 p-2 text-center">
            <h3 className="font-semibold text-blue-600 text-sm">SPONZORISANO</h3>
            <p className="text-xs text-gray-500">by {currentAd.sponsor}</p>
          </div>
          
          <div className="flex flex-1">
            <div className="w-1/3 bg-gray-200 flex items-center justify-center overflow-hidden relative">
              {currentAd.hasValidImage ? (
                <img 
                  src={currentAd.image} 
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center ${currentAd.hasValidImage ? 'hidden' : ''}`}>
                <div className="text-center">
                  <span className="text-2xl text-gray-500">📷</span>
                  <p className="text-xs text-gray-600 mt-1">Reklama</p>
                  <p className="text-xs text-gray-500 mt-1">{currentAd.sponsor}</p>
                </div>
              </div>
            </div>
            
            <div className="w-2/3 p-4 flex flex-col justify-center">
              <h4 className="font-bold text-md mb-2">{currentAd.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{currentAd.description}</p>
              <button 
                onClick={handleAdClick}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs self-start"
              >
                {currentAd.ctaText}
              </button>
            </div>
          </div>

          <div className="flex justify-center p-2 space-x-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentAdIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}