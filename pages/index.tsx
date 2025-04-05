import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import { useSession } from 'next-auth/react';
import UserNav from '@/components/UserNav';
import StorageSelector from '@/components/StorageSelector';
import { getStorageType, StorageType, saveToLocalStorage, getFromLocalStorage, saveToDrive, getFromDrive } from '@/utils/storage';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  const { data: session } = useSession();
  const [storageType, setStorageType] = useState<StorageType>('local');
  const [demoData, setDemoData] = useState<string>('');

  useEffect(() => {
    // Load storage preference and data on component mount
    const currentType = getStorageType();
    setStorageType(currentType);
    loadData(currentType);
  }, [session]);

  const loadData = async (type: StorageType) => {
    if (type === 'local') {
      const data = getFromLocalStorage('demoData');
      if (data) setDemoData(data);
    } else if (type === 'google' && session?.accessToken) {
      const data = await getFromDrive('app-demo-data.json', session.accessToken as string);
      if (data) setDemoData(data);
    }
  };

  const saveData = async () => {
    if (storageType === 'local') {
      saveToLocalStorage('demoData', demoData);
      alert('Saved to local storage!');
    } else if (storageType === 'google' && session?.accessToken) {
      const success = await saveToDrive('app-demo-data.json', demoData, session.accessToken as string);
      if (success) {
        alert('Saved to Google Drive!');
      } else {
        alert('Failed to save to Google Drive');
      }
    } else if (storageType === 'google') {
      alert('Please sign in with Google to save to Drive');
    }
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    loadData(type); // Load data from the new storage location
  };

  return (
    <div className={`grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 sm:p-20 ${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}>
      <header className="flex justify-between items-center w-full">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={25}
          priority
        />
        <UserNav />
      </header>

      <main className="flex flex-col items-center w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Next.js App with Storage Options</h1>
        
        <StorageSelector onStorageChange={handleStorageChange} />
        
        <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Demo Storage</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Type something below and click save to store it using your selected storage method.
          </p>
          
          <textarea
            value={demoData}
            onChange={(e) => setDemoData(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 min-h-[120px] mb-4"
            placeholder="Type something to save..."
          />
          
          <button
            onClick={saveData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Data
          </button>
        </div>
      </main>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <p>Currently using: {storageType === 'local' ? 'Browser Local Storage' : 'Google Drive Storage'}</p>
      </footer>
    </div>
  );
}
