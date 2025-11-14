'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase/config';
import Image from 'next/image';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/game');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative h-screen w-full bg-yellow-100">
      
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="bg-yellow-300 p-8 rounded-3xl shadow-lg w-96">
          <h1 className="text-3xl font-bold text-center mb-8">SIGN UP / LOGIN</h1>
          
          <form onSubmit={handleSignup} className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-xl font-semibold">USERNAME</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="p-3 rounded-lg border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-xl font-semibold">PASSWORD</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="p-3 rounded-lg border-2 border-yellow-400 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <button 
              type="submit" 
              className="bg-yellow-400 text-white py-3 px-8 rounded-lg text-xl font-bold hover:bg-yellow-500 transition-colors mt-4 self-center"
            >
              SIGN UP
            </button>
          </form>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          <p className="text-center mt-4">
            Already have an account? <a href="/login" className="text-yellow-600 hover:text-yellow-700">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}