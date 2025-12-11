'use client';
import Image from 'next/image';
import BackgroundBlobs from './BackgroundBlobs';

interface PageBackgroundProps {
  bgGradient?: string;
  imageOpacity?: number;
  blobOpacity?: number;
  showThirdBlob?: boolean;
}

export default function PageBackground({
  bgGradient = 'bg-gradient-to-br from-yellow-300 via-orange-300 to-red-400',
  imageOpacity = 40,
  blobOpacity = 30,
  showThirdBlob = true
}: PageBackgroundProps) {
  return (
    <>
      <div className={`relative w-full min-h-screen ${bgGradient} overflow-x-hidden`}>
        <Image
          src="/images/landing-bg.png"
          alt="Background"
          fill
          priority
          className="object-cover"
          style={{ opacity: imageOpacity / 100 }}
        />
        <BackgroundBlobs />
      </div>
    </>
  );
}

