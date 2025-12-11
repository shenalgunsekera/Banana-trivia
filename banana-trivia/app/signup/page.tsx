'use client';

import Head from 'next/head';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase/config';
import Image from 'next/image';
import BackgroundBlobs from '../../components/BackgroundBlobs';
import { isValidEmail, isValidPassword, getFirebaseErrorMessage } from '../../utils/validation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Please enter your email address.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    if (!password) return setError('Please enter a password.');
    if (!isValidPassword(password)) return setError('Password must be at least 6 characters long.');

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.push('/difficulty');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 overflow-hidden flex items-center justify-center px-4"
        style={{
          fontFamily: "Quicksand, Poppins, system-ui, sans-serif",
        }}
      >
        {/* Soft background image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/landing-bg.png"
            alt="Background"
            fill
            priority
          />
        </div>

        <BackgroundBlobs opacity={10} showThirdBlob={true} />

        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl p-10 sm:p-12 justify-items-center">

            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-pink-300 flex items-center justify-center shadow-md">
                <span className="text-white text-3xl font-bold">🍌</span>
              </div>
              <p className="text-3xl text-gray-800 font-bold">Login / Sign Up</p>
              <p className="text-gray-600 text-sm font-semibold">
                Create your account — it only takes a moment
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full px-4 py-3 rounded-2xl border-2 border-transparent 
                  focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-300 
                  bg-white shadow-sm text-sm font-medium placeholder-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-2 w-full px-4 py-3 rounded-2xl border-2 border-transparent 
                  focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-300 
                  bg-white shadow-sm text-sm font-medium placeholder-black"
                />
              </div>
              <div className=" mt-4 flex justify-center rounded-2xl">
              <button
                type="submit"
                disabled={isLoading}
                className=" w-30 py-6 font-bold text-lg transition-all
                duration-150 active:scale-70 hover:scale-[1.02] disabled:opacity-60 
                bg-gradient-to-r from-yellow-400 via-orange-300 to-pink-300 text-white shadow-xl rounded-4xl"
              >
                {isLoading ? 'Signing up...' : 'Create Account'}
              </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 text-center text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl font-semibold">
                {error}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-700">
              Already have an account?{' '}
              <a href="/login" className="text-pink-500 font-semibold underline">
                Login
              </a>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => router.push('/')}
                className=""
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
