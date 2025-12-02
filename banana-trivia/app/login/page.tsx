'use client';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Login() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/difficulty');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 overflow-x-hidden">
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-40"
      />

      {/* Animated blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-6xl sm:text-7xl lg:text-9xl mb-6 sm:mb-8 lg:mb-12 animate-bounce" style={{ animationDuration: '2s' }}>
          🍌
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl mb-2 sm:mb-3 text-center">
          Banana Trivia
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg mb-8 sm:mb-12 text-center">
          Sign in to play & compete
        </p>

        <div className="card p-6 sm:p-10 lg:p-12 w-full max-w-md">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-6 sm:mb-8 text-center">
            Welcome! 🎮
          </h2>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black rounded-2xl text-base sm:text-lg lg:text-xl hover:scale-105 transition-all duration-300 shadow-xl border-2 border-white/50 disabled:opacity-50 disabled:scale-100 flex-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin">⚙️</div>
                Signing in...
              </>
            ) : (
              <>
                <span>📧</span>
                Sign in with Google
              </>
            )}
          </button>

          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-semibold">
              ✨ Secure login • 🔒 Your data is safe • 🌐 No passwords needed
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-6 sm:mt-8 p-3 sm:p-4 px-6 sm:px-10 bg-white/70 text-gray-800 rounded-2xl font-bold hover:scale-105 transition-transform border-4 border-white/80 text-sm sm:text-base"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}