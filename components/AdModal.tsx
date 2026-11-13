import { useState, useEffect } from 'react';
import { AdDTO } from '@/lib/dtos';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ad: Partial<AdDTO>) => void;
  sponsorId: number;
  editingAd: AdDTO | null;
}

const AdModal = ({ isOpen, onClose, onSave, sponsorId, editingAd }: AdModalProps) => {
  const [formData, setFormData] = useState({
    resource_url: '',
    description: '',
    ad_costs: 100 
  });

  if (sponsorId === undefined) {
    throw new Error("Niste ulogovani kao sponzor");
  }

  useEffect(() => {
    if (editingAd) {
      setFormData({
        resource_url: editingAd.resource_url || '',
        description: editingAd.description || '',
        ad_costs: editingAd.adStats?.ad_costs || 100
      });
    } else {
      setFormData({
        resource_url: '',
        description: '',
        ad_costs: 100
      });
    }
  }, [editingAd, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingAd?.id,
      resource_url: formData.resource_url,
      description: formData.description,
      sponsorId: sponsorId,
      adStats: {
        id: editingAd?.adStats?.id,
        ad_costs: formData.ad_costs,
        number_of_views: editingAd?.adStats?.number_of_views || 0,
        revenue: 0, 
        sponsorId: sponsorId 
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingAd ? 'Izmeni reklamu' : 'Kreiraj novu reklamu'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">URL slike *</label>
            <input
              type="url"
              value={formData.resource_url}
              onChange={(e) => setFormData({...formData, resource_url: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Opis *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Opis reklame..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Troškovi reklame (RSD) *</label>
            <input
              type="number"
              value={formData.ad_costs}
              onChange={(e) => setFormData({...formData, ad_costs: Number(e.target.value)})}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Zarada će se automatski izračunati na osnovu broja pregleda
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingAd ? 'Sačuvaj izmene' : 'Kreiraj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdModal;