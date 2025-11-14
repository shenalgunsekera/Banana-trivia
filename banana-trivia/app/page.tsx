'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        
        {!showOptions ? (
          <button 
            onClick={() => setShowOptions(true)}
            className="bg-yellow-400 text-white px-12 py-3 rounded-lg text-2xl hover:bg-yellow-500 transition-colors"
          >
            PLAY
          </button>
        ) : (
          <div className="flex flex-col space-y-4">
            <Link 
              href="/login"
              className="bg-yellow-400 text-white px-12 py-3 rounded-lg text-xl hover:bg-yellow-500 transition-colors text-center"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="bg-yellow-400 text-white px-12 py-3 rounded-lg text-xl hover:bg-yellow-500 transition-colors text-center"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}