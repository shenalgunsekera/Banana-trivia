'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';

export default function DifficultySelect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex-center bg-gradient-to-br from-yellow-200 to-orange-200">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🍌</div>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const difficulties = [
    {
      name: 'EASY',
      emoji: '😊',
      description: '5 questions • 2 min timer',
      color: 'from-green-400 to-emerald-500',
      value: 'easy',
      icon: '⭐'
    },
    {
      name: 'MEDIUM',
      emoji: '😤',
      description: '10 questions • 1 min timer',
      color: 'from-yellow-400 to-orange-500',
      value: 'medium',
      icon: '⭐⭐'
    },
    {
      name: 'HARD',
      emoji: '🔥',
      description: '15 questions • 40 sec timer',
      color: 'from-red-400 to-pink-500',
      value: 'hard',
      icon: '⭐⭐⭐'
    }
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 overflow-x-hidden">
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-30"
      />

      {/* Animated blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl mb-2 sm:mb-4 text-center">
          Choose Your Challenge
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg mb-8 sm:mb-12 lg:mb-16 text-center">
          {user?.email}
        </p>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-5xl mb-8 sm:mb-12 lg:mb-16">
          {difficulties.map((diff) => (
            <div
              key={diff.value}
              onClick={() => router.push(`/game?difficulty=${diff.value}`)}
              className={`game-card bg-gradient-to-br ${diff.color} p-6 sm:p-8 lg:p-10 cursor-pointer hover:scale-110 transition-all duration-300`}
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 text-center animate-bounce">
                {diff.emoji}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white text-center mb-2 sm:mb-3 drop-shadow-lg">
                {diff.name}
              </h2>
              <p className="text-white font-bold text-center mb-3 sm:mb-4 drop-shadow-md text-sm sm:text-base">
                {diff.icon}
              </p>
              <p className="text-white font-semibold text-center drop-shadow-md mb-4 sm:mb-6 text-sm sm:text-base">
                {diff.description}
              </p>
              <button className="w-full p-2 sm:p-3 lg:p-4 bg-white/90 text-transparent bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text font-black rounded-xl text-sm sm:text-base lg:text-lg hover:scale-105 transition-transform border-2 border-white/50">
                Play {diff.name}
              </button>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="p-3 sm:p-4 px-6 sm:px-8 lg:px-12 bg-white/80 text-gray-800 rounded-2xl text-base sm:text-lg lg:text-xl font-black hover:scale-105 transition-transform border-4 border-white/80 drop-shadow-lg"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
