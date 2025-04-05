import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getStorageType, StorageType } from '@/utils/storage';

type StorageSelectorProps = {
  onStorageChange: (type: StorageType) => void;
};

export default function StorageSelector({ onStorageChange }: StorageSelectorProps) {
  const { data: session } = useSession();
  const [storageType, setStorageType] = useState<StorageType>('local');
  
  useEffect(() => {
    // Load the user's preference
    const currentType = getStorageType();
    setStorageType(currentType);
  }, []);
  
  const handleStorageChange = (type: StorageType) => {
    // Don't allow Google Drive unless signed in
    if (type === 'google' && !session) {
      alert('Please sign in with Google to use Google Drive storage');
      return;
    }
    
    setStorageType(type);
    localStorage.setItem('storagePreference', type);
    onStorageChange(type);
  };
  
  return (
    <div className="storage-selector flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">Storage Location</h3>
      
      <div className="flex space-x-4">
        <button
          onClick={() => handleStorageChange('local')}
          className={`px-4 py-2 rounded-md ${storageType === 'local' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
        >
          Browser Storage
        </button>
        
        <button
          onClick={() => handleStorageChange('google')}
          className={`px-4 py-2 rounded-md ${storageType === 'google' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          disabled={!session}
        >
          Google Drive
          {!session && <span className="block text-xs">(Sign in required)</span>}
        </button>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {storageType === 'local' 
          ? 'Your data is stored only in this browser.'
          : 'Your data is saved to your Google Drive account.'}
      </p>
    </div>
  );
}