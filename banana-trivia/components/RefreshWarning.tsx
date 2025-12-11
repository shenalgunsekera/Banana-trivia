'use client';
import { useEffect, useState } from 'react';

export default function RefreshWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning on page load
    setShowWarning(true);

    // Hide warning after 3 seconds
    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    // Warn user before page refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You will be logged out if you refresh or close this page. Are you sure?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideIn">
      <div className="bg-yellow-400 border-4 border-yellow-600 rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl max-w-md mx-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl">⚠️</div>
          <div className="flex-1">
            <p className="text-sm sm:text-base md:text-lg font-black text-gray-900">
              Session Warning
            </p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-gray-800 mt-1">
              You will be logged out if you refresh this page!
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-gray-700 hover:text-gray-900 font-black text-xl sm:text-2xl"
            aria-label="Close warning"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

