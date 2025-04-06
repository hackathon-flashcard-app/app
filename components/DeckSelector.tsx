import { useState, useEffect } from 'react';
import { 
  DeckMetadata, 
  getAllDecks, 
  getActiveDeckId, 
  setActiveDeck, 
  deleteDeck, 
  createDeck 
} from '@/utils/storage';

interface DeckSelectorProps {
  onDeckSelected: (deckId: string) => void;
}

export default function DeckSelector({ onDeckSelected }: DeckSelectorProps) {
  const [decks, setDecks] = useState<DeckMetadata[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // Load decks from storage
  useEffect(() => {
    const loadDecks = () => {
      const storedDecks = getAllDecks();
      setDecks(storedDecks);
      
      // Set active deck
      const activeId = getActiveDeckId();
      setActiveDeckId(activeId);
      
      // If we have an active deck, notify parent
      if (activeId) {
        onDeckSelected(activeId);
      } else if (storedDecks.length > 0) {
        // Set the first deck as active if none is selected
        setActiveDeck(storedDecks[0].id);
        setActiveDeckId(storedDecks[0].id);
        onDeckSelected(storedDecks[0].id);
      }
    };
    
    loadDecks();
  }, []);

  const handleDeckSelect = (deckId: string) => {
    setActiveDeck(deckId);
    setActiveDeckId(deckId);
    onDeckSelected(deckId);
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    const newDeck = createDeck(newDeckName, newDeckDescription);
    
    // Update UI state
    setDecks(getAllDecks());
    setActiveDeckId(newDeck.id);
    onDeckSelected(newDeck.id);
    
    // Reset form and close modal
    setNewDeckName('');
    setNewDeckDescription('');
    setIsCreateModalOpen(false);
  };

  const confirmDeleteDeck = (deckId: string) => {
    setDeckToDelete(deckId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDeck = () => {
    if (!deckToDelete) return;
    
    deleteDeck(deckToDelete);
    
    // Update UI state
    const updatedDecks = getAllDecks();
    setDecks(updatedDecks);
    
    // Handle active deck change if needed
    if (activeDeckId === deckToDelete) {
      const newActiveId = updatedDecks.length > 0 ? updatedDecks[0].id : null;
      setActiveDeckId(newActiveId);
      if (newActiveId) {
        onDeckSelected(newActiveId);
      }
    }
    
    // Reset and close modal
    setDeckToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Your Decks</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          + New Deck
        </button>
      </div>
      
      {decks.length === 0 ? (
        <div className="text-center p-4 bg-gray-700 rounded-md">
          <p className="text-gray-300 mb-2">No decks found</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Create your first deck
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {decks.map(deck => (
            <div 
              key={deck.id}
              className={`flex justify-between items-center p-3 rounded-md cursor-pointer ${
                activeDeckId === deck.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleDeckSelect(deck.id)}
            >
              <div>
                <h3 className="font-medium text-white">{deck.name}</h3>
                <p className="text-xs text-gray-300">{deck.cardCount} cards</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteDeck(deck.id);
                }}
                className="text-gray-400 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-gray-800 rounded-lg p-6 w-80">
            <h2 className="text-xl font-bold text-white mb-4">Create New Deck</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Deck Name</label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter deck name"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
              <textarea
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
                className={`px-4 py-2 text-white rounded ${
                  newDeckName.trim() ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-800 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-gray-800 rounded-lg p-6 w-80 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Delete Deck</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this deck? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeck}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
