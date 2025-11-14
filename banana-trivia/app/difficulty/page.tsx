'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';

export default function DifficultySelect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-yellow-100">
        <p className="text-2xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-b from-yellow-200 to-yellow-300">
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-lg">
          <h1 className="text-4xl font-bold text-center mb-8">Select Difficulty</h1>
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/game?difficulty=easy')}
              className="w-full p-4 bg-green-400 text-white rounded-xl text-xl font-bold hover:bg-green-500 transition-colors"
            >
              EASY
            </button>
            <button 
              onClick={() => router.push('/game?difficulty=medium')}
              className="w-full p-4 bg-yellow-400 text-white rounded-xl text-xl font-bold hover:bg-yellow-500 transition-colors"
            >
              MEDIUM
            </button>
            <button 
              onClick={() => router.push('/game?difficulty=hard')}
              className="w-full p-4 bg-red-400 text-white rounded-xl text-xl font-bold hover:bg-red-500 transition-colors"
            >
              HARD
            </button>
          </div>
          <button 
            onClick={() => router.push('/game')}
            className="w-full p-4 mt-8 bg-gray-200 text-gray-700 rounded-xl text-xl font-bold hover:bg-gray-300 transition-colors"
          >
            PLAY
          </button>
        </div>
      </div>
    </div>
  );
}
