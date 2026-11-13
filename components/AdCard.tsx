import { AdDTO } from '@/lib/dtos';

interface AdCardProps {
  ad: AdDTO;
  onEdit: (ad: AdDTO) => void;
  onDelete: (id: number) => void;
  revenueFactor: number;
}

const AdCard = ({ ad, onEdit, onDelete, revenueFactor }: AdCardProps) => {
  const calculatedRevenue = (ad.adStats?.number_of_views || 0) * revenueFactor;
  const adCosts = ad.adStats?.ad_costs || 0;
  const roi = adCosts > 0 ? ((calculatedRevenue - adCosts) / adCosts * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{ad.description || 'Reklama bez opisa'}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(ad)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Izmeni
          </button>
          <button 
            onClick={() => ad.id && onDelete(ad.id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Obriši
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <span className="font-medium">URL:</span> 
        <a href={ad.resource_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 break-all">
          {ad.resource_url}
        </a>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Troškovi:</span> {adCosts} RSD
        </div>
        <div>
          <span className="font-medium">Pregledi:</span> {ad.adStats?.number_of_views || 0}
        </div>
        <div>
          <span className="font-medium">Prihodi:</span> {calculatedRevenue.toFixed(2)} RSD
        </div>
        <div>
          <span className="font-medium">ROI:</span> {roi.toFixed(2)}%
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Zarada: {ad.adStats?.number_of_views || 0} × {revenueFactor} RSD
      </div>
    </div>
  );
};

export default AdCard;