'use client';
import Image from 'next/image';

interface LoadingScreenProps {
  bgColor?: string;
  message?: string;
}

export default function LoadingScreen({ 
  bgColor = 'bg-gradient-to-br from-yellow-200 to-orange-200',
  message = 'Loading...'
}: LoadingScreenProps) {
  return (
    <div className={`relative w-full min-h-screen ${bgColor} overflow-x-hidden flex items-center justify-center`}>
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-30"
      />
      <div className="relative z-10 text-center space-y-6">
        <div className="animate-spin text-6xl sm:text-7xl md:text-8xl">🍌</div>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          {message}
        </p>
      </div>
    </div>
  );
}

