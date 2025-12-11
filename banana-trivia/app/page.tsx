'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import BackgroundBlobs from '../components/BackgroundBlobs';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400 overflow-x-hidden">
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-40"
      />

      {/* Animated background blobs */}
      <BackgroundBlobs />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Main Content Container */}
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center animate-slideIn space-y-6 sm:space-y-8 md:space-y-10 mb-20 sm:mb-24 md:mb-28 lg:mb-32">
            <div className="text-7xl sm:text-8xl md:text-9xl animate-bounce" style={{ animationDuration: '2s' }}>
              🍌
            </div>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl leading-tight">
                Banana Trivia
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                Test Your Math Skills!
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white/90 drop-shadow-md">
                Solve quick math problems under pressure
              </p>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 w-full mb-20 sm:mb-24 md:mb-28 lg:mb-32">
            {[
              { icon: '⚡', label: 'Fast', desc: 'Quick rounds' },
              { icon: '🔥', label: 'Intense', desc: '3 difficulties' },
              { icon: '🏆', label: 'Compete', desc: 'Leaderboards' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="card p-8 sm:p-10 md:p-12 transform hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center justify-center space-y-4 sm:space-y-5"
              >
                <div className="text-5xl sm:text-6xl md:text-7xl animate-bounce" style={{ animationDuration: '2s', animationDelay: `${idx * 0.2}s` }}>
                  {stat.icon}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <p className="font-black text-gray-800 text-base sm:text-lg md:text-xl lg:text-2xl">
                    {stat.label}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons Section */}
          <div className="flex flex-col items-center w-full my-24 sm:my-28 md:my-32 lg:my-36 px-4 sm:px-6 md:px-8">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="animate-spin text-6xl sm:text-7xl">🍌</div>
                <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">Loading...</p>
              </div>
            ) : user ? (
              <div className="w-full flex justify-center items-center py-16 sm:py-20 md:py-24 lg:py-28">
                <button 
                  onClick={() => router.push('/difficulty')}
                  className="relative px-24 sm:px-32 md:px-40 lg:px-48 py-10 sm:py-12 md:py-16 lg:py-20 bg-white text-gray-900 font-black rounded-full text-3xl sm:text-4xl md:text-5xl lg:text-6xl hover:scale-105 transition-all duration-300 shadow-xl active:scale-95 whitespace-nowrap overflow-hidden group"
                  aria-label="Start playing the game"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    Play Now
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-full"></span>
                </button>
              </div>
            ) : (
              <div className="w-40 max-w-lg space-y-4 sm:space-y-5">
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-white text-gray-900 font-black rounded-full text-lg sm:text-xl md:text-2xl hover:scale-105 transition-all duration-300 shadow-xl border-2 border-gray-200 active:scale-95 group relative overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    Start Playing
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="w-full px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-white text-gray-900 font-black rounded-full text-lg sm:text-xl md:text-2xl hover:scale-105 transition-all duration-300 shadow-xl border-2 border-gray-200 active:scale-95 group relative overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    Login / Sign Up
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                </button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="text-center w-full flex flex-col items-center mt-16 sm:mt-20 md:mt-24 lg:mt-28 space-y-8 sm:space-y-10 md:space-y-12">
            <p className="text-white font-bold text-base sm:text-lg md:text-2xl lg:text-2xl drop-shadow-lg">
              ✨ Features
            </p>
            <div className="glass-effect p-8 sm:p-10 md:p-12 rounded-3xl border-2 border-white/50 w-full max-w-2xl">
              <p className="text-white font-semibold text-sm sm:text-base md:text-lg leading-relaxed">
                ⏱️ <span className="hidden sm:inline">Timed challenges • </span>
                🎯 <span className="hidden sm:inline">Multiple difficulties • </span>
                📊 <span className="hidden sm:inline">Track your progress • </span>
                <span className="sm:hidden">Quick gameplay • Multiple modes • Leaderboards</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '../components/ErrorBoundary';
import RefreshWarning from '../components/RefreshWarning';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Banana Trivia - Math Challenge Game',
  description: 'Test your math skills in this fast-paced trivia game with multiple difficulty levels',
  keywords: ['trivia', 'math', 'game', 'challenge', 'banana', 'quiz'],
  authors: [{ name: 'Banana Trivia Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#fbbf24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <RefreshWarning />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}