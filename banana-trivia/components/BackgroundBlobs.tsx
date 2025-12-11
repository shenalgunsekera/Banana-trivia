'use client';

interface BackgroundBlobsProps {
  className?: string;
  opacity?: number;
  showThirdBlob?: boolean;
}

export default function BackgroundBlobs({ 
  className = '', 
  opacity = 30,
  showThirdBlob = true 
}: BackgroundBlobsProps) {
  return (
    <>
      {/* Animated background blobs */}
      <div 
        className={`absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400 to-transparent rounded-full blur-3xl animate-pulse ${className}`}
        style={{ opacity: opacity / 100 }}
      ></div>
      <div 
        className={`absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl animate-pulse ${className}`}
        style={{ opacity: opacity / 100 }}
      ></div>
      {showThirdBlob && (
        <div 
          className={`hidden sm:block absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-300 to-transparent rounded-full blur-3xl animate-pulse ${className}`}
          style={{ opacity: (opacity * 0.67) / 100, animationDelay: '1s' }}
        ></div>
      )}
    </>
  );
}

