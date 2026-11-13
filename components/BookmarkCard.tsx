import { BookmarkDTO } from "@/lib/dtos";
import Link from "next/link";
import { useState } from "react";

interface BookmarkCardProps {
  bookmark: BookmarkDTO;
  userId: number;
  cookbookId: number;
  onDelete: (bookmarkId: number) => void;
  onUpdate: (bookmarkId: number, newTitle: string) => Promise<boolean>;
}

export default function BookmarkCard({ bookmark, userId, cookbookId, onDelete, onUpdate }: BookmarkCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [updating, setUpdating] = useState(false);

  const handleUpdateBookmark = async () => {
    if (!editTitle.trim()) {
      alert('Naslov ne može biti prazan');
      return;
    }

    if (editTitle === bookmark.title) {
      setShowEdit(false);
      return;
    }

    try {
      setUpdating(true);
      const success = await onUpdate(bookmark.id, editTitle);
      if (success) {
        setShowEdit(false);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      alert('Greška pri ažuriranju bookmarka: ' + (error as Error).message);
      setEditTitle(bookmark.title);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(bookmark.title);
    setShowEdit(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateBookmark();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {showEdit ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unesite naziv bookmarka"
                disabled={updating}
                autoFocus
              />
              <button
                onClick={handleUpdateBookmark}
                disabled={updating || !editTitle.trim()}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {updating ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    <span>Čeka se...</span>
                  </>
                ) : (
                  '✓'
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updating}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {bookmark.title}
              </h3>
              <button
                onClick={() => setShowEdit(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm p-1"
                title="Izmeni naziv bookmarka"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onDelete(bookmark.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium ml-4 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
          disabled={updating}
        >
          Obriši
        </button>
      </div>

      {bookmark.recipe && (
        <div className="bg-gray-50 rounded-lg p-4 mt-3">
          <Link 
            href={`/recipe/${bookmark.recipe.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium block mb-2 text-lg"
          >
            {bookmark.recipe.title}

          </Link>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">Vreme pripreme:</span>
              <span>{bookmark.recipe.preparation_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Pregleda:</span>
              <span>{bookmark.recipe.number_of_views}</span>
            </div>
            {bookmark.recipe.chefBeginner?.user && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Autor:</span>
                <span>{bookmark.recipe.chefBeginner.user.first_name} {bookmark.recipe.chefBeginner.user.last_name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}