'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';

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
      <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="hidden sm:block absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-300 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        {/* Main Content Container */}
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20 animate-slideIn">
            <div className="text-7xl sm:text-8xl md:text-9xl mb-4 sm:mb-6 md:mb-8 animate-bounce" style={{ animationDuration: '2s' }}>
              🍌
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl mb-3 sm:mb-4 md:mb-6 leading-tight">
              Banana Trivia
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg mb-2 sm:mb-3">
              Test Your Math Skills!
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white/90 drop-shadow-md">
              Solve quick math problems under pressure
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-16 md:mb-20 w-full">
            {[
              { icon: '', label: 'Fast', desc: 'Quick rounds' },
              { icon: '', label: 'Intense', desc: '3 difficulties' },
              { icon: '', label: 'Compete', desc: 'Leaderboards' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="card p-6 sm:p-7 md:p-8 transform hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center justify-center"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
                  {stat.icon}
                </div>
                <p className="font-black text-gray-800 text-base sm:text-lg md:text-xl mb-2">
                  {stat.label}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons Section */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-12 sm:mb-16 md:mb-20 w-full">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin text-6xl sm:text-7xl mb-4">🍌</div>
                <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">Loading...</p>
              </div>
            ) : user ? (
              <button 
                onClick={() => router.push('/difficulty')}
                className="px-12 sm:px-16 md:px-20 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black rounded-2xl text-lg sm:text-xl md:text-2xl lg:text-3xl hover:scale-110 transition-all duration-300 shadow-2xl border-4 border-white/80 drop-shadow-lg active:scale-95 whitespace-nowrap"
              >
                <span className="inline-block">🎮</span> Play Now <span className="inline-block">🎮</span>
              </button>
            ) : (
              <div className="w-full max-w-md space-y-3 sm:space-y-4">
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black rounded-2xl text-base sm:text-lg md:text-xl hover:scale-110 transition-all duration-300 shadow-2xl border-4 border-white/80 drop-shadow-lg active:scale-95"
                >
                  Start Playing
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full p-4 sm:p-5 md:p-6 rounded-2xl text-base sm:text-lg md:text-xl font-black hover:scale-110 transition-all duration-300 border-4 border-white/80 drop-shadow-lg active:scale-95 text-white shadow-2xl"
                  style={{
                    background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  }}
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="text-center w-full pb-8 sm:pb-12 md:pb-16 flex flex-col items-center">
            <p className="text-white font-bold text-base sm:text-lg md:text-2xl lg:text-2xl drop-shadow-lg mb-4 sm:mb-6">
              ✨ Features
            </p>
            <div className="glass-effect p-6 sm:p-8 md:p-10 rounded-3xl border-2 border-white/50 w-full max-w-2xl">
              <p className="text-white font-semibold text-sm sm:text-base md:text-lg leading-relaxed">
                ⏱️ <span className="hidden sm:inline">Timed challenges • </span>
                🎯 <span className="hidden sm:inline">Multiple difficulties • </span>
                📊 <span className="hidden sm:inline">Track your progress • </span>
                🏅 <span className="hidden sm:inline">Compete with others</span>
                <span className="sm:hidden">Quick gameplay • Multiple modes • Leaderboards</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}