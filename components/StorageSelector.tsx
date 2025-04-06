import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { getStorageType, StorageType } from '@/utils/storage';

type StorageSelectorProps = {
  onStorageChange: (type: StorageType) => void;
  onFileNameChange: (fileName: string) => void;
};

export default function StorageSelector({ onStorageChange, onFileNameChange }: StorageSelectorProps) {
  const { data: session } = useSession();
  const [storageType, setStorageType] = useState<StorageType>('file');
  const [fileName, setFileName] = useState<string>('data.json');
  
  useEffect(() => {
    // Load the user's preference
    const currentType = getStorageType();
    setStorageType(currentType);
    
    // Load saved file name if any
    const savedFileName = localStorage.getItem('fileName');
    if (savedFileName) {
      setFileName(savedFileName);
      onFileNameChange(savedFileName);
    } else {
      onFileNameChange(fileName);
    }
  }, [onFileNameChange]);
  
  const handleStorageChange = async (type: StorageType) => {
    // Don't allow Google Drive unless signed in
    if (type === 'google' && !session) {
      alert('Please sign in with Google to use Google Drive storage');
      return;
    }
    
    try {
      // Save in localStorage for client-side access
      localStorage.setItem('storagePreference', type);
      
      setStorageType(type);
      onStorageChange(type);
    } catch (error) {
      console.error('Error saving storage preference:', error);
      alert('Failed to change storage location');
    }
  };
  
  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFileName = event.target.value;
    
    // Ensure filename ends with .json
    let validFileName = newFileName;
    if (!validFileName.endsWith('.json')) {
      validFileName = validFileName + '.json';
    }
    
    setFileName(validFileName);
    localStorage.setItem('fileName', validFileName);
    onFileNameChange(validFileName);
  };
  
  return (
    <div className="storage-selector flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">Storage Location</h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleStorageChange('file')}
          className={`px-4 py-2 rounded-md ${storageType === 'file' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
        >
          Local File
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
      
      {storageType === 'file' && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            File Name:
            <input
              type="text"
              value={fileName}
              onChange={handleFileNameChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="data.json"
            />
          </label>
        </div>
      )}
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {storageType === 'file'
          ? 'Your data will be saved to a local JSON file.'
          : 'Your data is saved to your Google Drive account.'}
      </p>
    </div>
  );
}