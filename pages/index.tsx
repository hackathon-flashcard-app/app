import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/deckManager' });
  };

  const handleContinueAsGuest = () => {
    // Set storage preference to file (local storage)
    localStorage.setItem('storagePreference', 'file');
    router.push('/deckManager');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${geistSans.variable} ${geistMono.variable}`}>
      <Head>
        <title>Beaver Brilliance</title>
      </Head>
      <main className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <Image
              src="/images/beaver_cropped.png"
              alt="Flashcard App Logo"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards App</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and study flashcards with ease</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
              </div>
            </div>
            
            <button
              onClick={handleContinueAsGuest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 text-sm font-medium transition-colors"
            >
              Continue as Guest
            </button>
          </div>
          
          <p className="mt-6 text-xs text-center text-gray-600 dark:text-gray-400">
            Guest users can save flashcards to local files
          </p>
        </div>
      </main>
      
      <footer className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        © 2025 BeaverHacks, Beaver Brilliance Team.
      </footer>
    </div>
  );
}
