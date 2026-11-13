import { useState, useEffect } from 'react';

interface StatisticsProps {
  stats?: {
    totalCosts: number;
    totalRevenue: number;
    totalViews: number;
    adsCount?: number;
  };
  revenueFactor: number;
  isAdmin?: boolean;
}

interface AggregatedStats {
  totalCosts: number;
  totalRevenue: number;
  totalViews: number;
  adsCount: number;
  sponsorsCount?: number;
  revenueFactor: number;
}

const Statistics = ({ stats, revenueFactor, isAdmin = false }: StatisticsProps) => {
  const [adminStats, setAdminStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ad/stats/admin');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      
      const adminStatsData = await response.json();
      setAdminStats(adminStatsData);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Došlo je do greške pri učitavanju administratorskih statistika');
    } finally {
      setLoading(false);
    }
  };

  const displayStats = isAdmin ? adminStats : stats;

  if (isAdmin && loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Statistika svih reklama</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Učitavanje statistike...</span>
        </div>
      </div>
    );
  }

  if (isAdmin && error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Statistika svih reklama</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={fetchAdminStats}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">
        {isAdmin ? 'Statistika svih reklama' : 'Statistika'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Ukupni troškovi</h3>
          <p className="text-2xl font-bold">{displayStats?.totalCosts || 0} RSD</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Ukupni prihodi</h3>
          <p className="text-2xl font-bold">
            {displayStats?.totalRevenue ? displayStats.totalRevenue.toFixed(2) : '0.00'} RSD
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Ukupni pregledi</h3>
          <p className="text-2xl font-bold">{displayStats?.totalViews || 0}</p>
        </div>
        
        {isAdmin ? (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">Ukupno reklama</h3>
            <p className="text-2xl font-bold">{displayStats?.adsCount || 0}</p>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Faktor zarade</h3>
            <p className="text-2xl font-bold">{revenueFactor} RSD/pregled</p>
          </div>
        )}
      </div>

      {isAdmin && adminStats?.sponsorsCount !== undefined && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800">Broj sponzora</h4>
            <p className="text-xl font-bold">{adminStats.sponsorsCount}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800">Prosečno po reklami</h4>
            <p className="text-lg">
              {(adminStats.totalViews / (adminStats.adsCount || 1)).toFixed(1)} pregleda
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Napomena:</strong>{' '}
          {isAdmin 
            ? 'Prikazana je agregirana statistika svih reklama svih sponzora u sistemu.'
            : `Zarada se automatski izračunava kao: Pregledi × ${revenueFactor} RSD`
          }
        </p>
      </div>

      {isAdmin && (
        <div className="mt-3 text-xs text-gray-500">
          <p>Poslednje ažuriranje: {new Date().toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;