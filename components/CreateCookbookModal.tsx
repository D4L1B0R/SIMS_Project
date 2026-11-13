interface CreateCookbookModalProps {
  newCookbook: { title: string; description: string };
  setNewCookbook: (data: { title: string; description: string } | ((prev: { title: string; description: string }) => { title: string; description: string })) => void;
  setShowCreateModal: (show: boolean) => void;
  handleCreateCookbook: (e: React.FormEvent) => void;
}

export default function CreateCookbookModal({
  newCookbook,
  setNewCookbook,
  setShowCreateModal,
  handleCreateCookbook
}: CreateCookbookModalProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Kreiraj novi cookbook</h2>
        
        <form onSubmit={handleCreateCookbook}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naziv cookbooka *
              </label>
              <input
                type="text"
                required
                value={newCookbook.title}
                onChange={(e) => setNewCookbook(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unesite naziv cookbooka"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis (opciono)
              </label>
              <textarea
                value={newCookbook.description}
                onChange={(e) => setNewCookbook(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unesite opis cookbooka"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kreiraj
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}