'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundBlobs from '../../components/BackgroundBlobs';
import { getFirebaseErrorMessage } from '../../utils/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function Login() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();

  // local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // for email/password flows
  const [error, setError] = useState<string>('');

  // if user already logged in, redirect
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/difficulty');
    }
  }, [user, authLoading, router]);



  // Email / Password login
  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email?.trim()) return setError('Please enter your email address.');
    if (!password) return setError('Please enter your password.');

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/difficulty'); // immediate redirect on success
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err) || (err?.message ?? 'Failed to sign in. Please try again.'));
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
        style={{ fontFamily: "Quicksand, Poppins, system-ui, sans-serif" }}
      >
        {/* subtle background image */}
        <div className="absolute inset-0 -z-20">
          <Image src="/images/landing-bg.png" alt="Background" fill priority className="object-cover opacity-10" />
        </div>

        {/* decorative blobs */}
        <BackgroundBlobs opacity={10} showThirdBlob={true} />

        <div className="relative z-10 w-full max-w-lg items-center">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl p-10 justify-items-center " >

            {/* header */}
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-pink-300 flex items-center justify-center shadow-md">
                <span className="text-white text-3xl font-bold">🍌</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">Welcome back!</p>
              <p className="text-gray-600 text-sm font-semibold">Sign in to continue</p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="items-center justify-center space-x-7 mt-4 max-w-100">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full px-4 py-3 rounded-2xl border-2 border-transparent
                    focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-300
                    bg-white shadow-sm text-sm font-medium placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="mt-2 w-full px-4 py-3 rounded-2xl border-2 border-transparent
                    focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-300
                    bg-white shadow-sm text-sm font-medium placeholder-gray-400"
                />
              </div>

              <div className=" mt-4 flex justify-center rounded-2xl">
              <button
                type="submit"
                disabled={isLoading}
                className="w-30 py-3 rounded-full font-bold text-lg transition-all duration-150 active:scale-95 hover:scale-[1.02] disabled:opacity-60
                  bg-gradient-to-r from-yellow-400 via-orange-300 to-pink-300 text-white shadow-xl"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              </div>
            </form>

            {/* OR divider */}
            <div className="my-5 flex items-center gap-3">
              <hr className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <hr className="flex-1 border-t border-gray-200" />
            </div>

            

            {/* Error message */}
            {error && (
              <div className="mt-4 text-center text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Links */}
            <div className="mt-6 text-center text-sm text-gray-700">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-500 font-semibold underline">Create one</a>
            </div>

            <div className="mt-4 flex justify-center r">
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
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
