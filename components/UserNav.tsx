import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function UserNav() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <div className="flex items-center gap-4">
      {loading ? (
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
      ) : session ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{session.user?.name}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-blue-600 hover:underline"
            >
              Sign out
            </button>
          </div>
          {session.user?.image && (
            <Image 
              src={session.user.image} 
              alt="Profile" 
              width={32} 
              height={32}
              className="rounded-full" 
            />
          )}
        </div>
      ) : (
        <Link 
          href="/login"
          className="text-sm text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}