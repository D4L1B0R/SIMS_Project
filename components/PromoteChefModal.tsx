import { useState, useEffect } from 'react';
import { UserDTO } from '@/lib/dtos';

interface PromoteChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromote: (chefId: number, chefName: string) => void;
}

interface ChefDTO {
  id: number;
  first_name: string;
  last_name: string;
  chefBeginner?: {
    id: number;
    privileged_user: boolean;
  };
}

const PromoteChefModal = ({ isOpen, onClose, onPromote }: PromoteChefModalProps) => {
  const [chefs, setChefs] = useState<ChefDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChef, setSelectedChef] = useState<ChefDTO | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChefs();
    }
  }, [isOpen]);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch chefs');
      }
      
      const allUsers: UserDTO[] = await response.json();
      
      const nonPremiumChefs = allUsers.filter(user => 
        user.chefBeginner && !user.chefBeginner.privileged_user
      ).map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        chefBeginner: user.chefBeginner
      }));
      
      setChefs(nonPremiumChefs);
    } catch (err) {
      console.error('Error fetching chefs:', err);
      setError('Došlo je do greške pri učitavanju kuvara');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = () => {
    if (selectedChef) {
      onPromote(selectedChef.id, `${selectedChef.first_name} ${selectedChef.last_name}`);
      setSelectedChef(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Promoviši kuvaru</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Izaberite kuvara za promociju
          </label>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : chefs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nema kuvara dostupnih za promociju
            </div>
          ) : (
            <select
              value={selectedChef?.id || ''}
              onChange={(e) => {
                const chefId = parseInt(e.target.value);
                const chef = chefs.find(c => c.id === chefId) || null;
                setSelectedChef(chef);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Izaberite kuvara...</option>
              {chefs.map(chef => (
                <option key={chef.id} value={chef.id}>
                  {chef.first_name} {chef.last_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedChef && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Potvrda promocije</h3>
            <p className="text-blue-700">
              Da li želite da promovišete kuvara{' '}
              <strong>{selectedChef.first_name} {selectedChef.last_name}</strong>?
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Ovaj kuvar će dobiti premium status i biće prikazivan u posebnom delu aplikacije.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Otkaži
          </button>
          <button
            type="button"
            onClick={handlePromote}
            disabled={!selectedChef || loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Promoviši
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteChefModal;