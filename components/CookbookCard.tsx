import { CookbookDTO } from "@/lib/dtos";
import { Trash2 } from "lucide-react";
import Link from "next/link";

interface CookbookCardProps {
  cookbook: CookbookDTO;
  userId: number;
  onDelete: (cookbookId: number) => void;
}

export default function CookBookCard({ cookbook, userId, onDelete }: CookbookCardProps) {
  const bookmarkCount = cookbook.bookmarks?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
              {cookbook.title}
            </h3>
            <button 
              onClick={()=> onDelete(cookbook.id)}
              className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"
              title="Obriši knjigu recepata"
            >
              <Trash2 size={20} className="text-red-600" />
            </button>
          </div>
          <Link href={`/user/${userId}/cookbook/${cookbook.id}`}>
            {cookbook.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3  cursor-pointer">
                {cookbook.description}
              </p>
            )}
            
            <div className="flex justify-between items-center text-sm  cursor-pointer text-gray-500">
              <span>{bookmarkCount} {bookmarkCount === 1 ? 'recept' : 'recepta'}</span>
              {/* <span className="text-blue-600 hover:text-blue-800">Pogledaj →</span> */}
            </div>
          
          </Link>
        </div>
    </div>
  );
}