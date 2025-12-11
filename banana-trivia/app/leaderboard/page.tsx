'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';
import BackgroundBlobs from '../../components/BackgroundBlobs';
import LoadingScreen from '../../components/LoadingScreen';

type LeaderboardEntry = {
  uid: string;
  displayName?: string;
  email?: string;
  topScore: number;
  updatedAt?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
};

const DIFFICULTIES: { key: 'easy' | 'medium' | 'hard'; label: string; color: string }[] = [
  { key: 'easy', label: 'Easy', color: 'from-green-300 to-emerald-400' },
  { key: 'medium', label: 'Medium', color: 'from-yellow-300 to-orange-400' },
  { key: 'hard', label: 'Hard', color: 'from-red-300 to-pink-400' }
];

export default function LeaderboardPage() {
 const router = useRouter();
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic and fetching
  useEffect(() => {
    console.log('--- Leaderboard debug start ---');
    console.log('useAuth user:', user);

    try {
      const dbPreview = (db as any)?.app?.options || db;
      console.log('Firestore db preview:', dbPreview);
    } catch (e) {
      console.warn('Could not inspect db object:', e);
    }

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const colRef = collection(db, 'leaderboard');
        console.log('Attempting getDocs on collection: leaderboard', colRef);

        const snap = await getDocs(colRef);
        console.log('getDocs success, docs count:', snap.size);

        const all: LeaderboardEntry[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data() as any;
          all.push({
            uid: docSnap.id,
            displayName: data.displayName || data.name || '',
            email: data.email || '',
            topScore: typeof data.topScore === 'number' ? data.topScore : 0,
            updatedAt: data.updatedAt || '',
            difficulty: (data.difficulty || 'medium') as LeaderboardEntry['difficulty']
          });
        });

        // keep a sorted global list too (for debug)
        all.sort((a, b) => b.topScore - a.topScore);
        setEntries(all.slice(0, 50));
        setError(null);
      } catch (err: any) {
        console.error('Leaderboard fetch error (full):', err);
        console.error('Error code:', err?.code);
        console.error('Error message:', err?.message);
        setEntries([]);
        if (err?.code === 'permission-denied' || /permission/i.test(err?.message || '')) {
          setError('Permission denied: your client cannot read the leaderboard. Check Firestore rules and that you are signed in (if rules require authentication).');
        } else {
          setError(err?.message || 'Failed to load leaderboard. Please try again later.');
        }
      } finally {
        setIsLoading(false);
        console.log('--- Leaderboard debug end ---');
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return <LoadingScreen bgColor="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50" />;
  }

  // helpers
  const topForDifficulty = (d: string, n = 3) =>
    entries.filter(e => (e.difficulty || 'medium').toLowerCase() === d.toLowerCase())
      .sort((a, b) => b.topScore - a.topScore)
      .slice(0, n);

  const PodiumSmall = ({ list }: { list: LeaderboardEntry[] }) => {
    const first = list[0];
    const second = list[1];
    const third = list[2];

    return (
        
      <div className="flex items-end gap-4 justify-center">
        <div className="flex flex-col items-center">
          <div className="text-xs text-black mb-1">2nd</div>
          <div className="w-12 h-14 rounded-t-md bg-gray-100 flex items-center justify-center shadow-inner border border-white/60">
            <div className="text-sm font-bold">{second?.topScore ?? '—'}</div>
          </div>
          <div className="mt-1 w-20 text-xs text-center text-black truncate">{second?.displayName ?? '—'}</div>
        </div>
        


        <div className="flex flex-col items-center">
          <div className="text-xs text-black mb-1">1st</div>
          <div className="w-16 h-18 rounded-t-md bg-yellow-200 flex items-center justify-center shadow-inner border border-white/60">
            <div className="text-sm font-extrabold">{first?.topScore ?? '—'}</div>
          </div>
          <div className="mt-1 w-28 text-xs font-semibold text-center text-black truncate">{first?.displayName ?? '—'}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-black mb-1">3rd</div>
          <div className="w-12 h-12 rounded-t-md bg-orange-200 flex items-center justify-center shadow-inner border border-white/60">
            <div className="text-sm font-bold">{third?.topScore ?? '—'}</div>
          </div>
          <div className="mt-1 w-20 text-xs text-center text-black truncate">{third?.displayName ?? '—'}</div>
        </div>
        <hr></hr>
      </div>

    );
  };

  const PodiumFull = ({ list }: { list: LeaderboardEntry[] }) => {
    const first = list[0];
    const second = list[1];
    const third = list[2];

    return (
      <div className="flex items-end gap-6 justify-center">
        <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
          <div className="mb-2 text-sm font-semibold">2nd</div>
          <div className="w-28 h-40 rounded-t-2xl bg-gradient-to-b from-gray-300 to-gray-400 flex items-end justify-center shadow-2xl border-4 border-white/80">
            <div className="bg-white/95 w-full p-3 rounded-t-xl text-center">
              <div className="font-bold text-gray-800">{second?.topScore ?? '—'}</div>
              <div className="text-xs text-gray-800 truncate">{second?.displayName ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
          <div className="mb-2 text-lg font-extrabold">1st</div>
          <div className="w-36 h-52 rounded-t-2xl bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-end justify-center shadow-2xl border-4 border-white/80">
            <div className="bg-white/95 w-full p-4 rounded-t-xl text-center">
              <div className="font-extrabold text-2xl text-gray-800">{first?.topScore ?? '—'}</div>
              <div className="text-sm text-gray-800 truncate">{first?.displayName ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
          <div className="mb-2 text-sm font-semibold">3rd</div>
          <div className="w-24 h-32 rounded-t-2xl bg-gradient-to-b from-orange-300 to-orange-400 flex items-end justify-center shadow-2xl border-4 border-white/80">
            <div className="bg-white/95 w-full p-3 rounded-t-xl text-center">
              <div className="font-bold text-gray-800">{third?.topScore ?? '—'}</div>
              <div className="text-xs text-gray-800 truncate">{third?.displayName ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Leaderboards — Banana Trivia</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="relative flex justify-center pt-10 w-full min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 overflow-hidden py-12">
        <div className="absolute inset-0 -z-20">
          <Image src="/images/landing-bg.png" alt="bg" fill priority className="object-cover opacity-8" />
        </div>

        <BackgroundBlobs opacity={8} showThirdBlob={true} />

        <div className="relative z-10 px-6 mx-auto max-w-6xl w-full">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Quicksand, Poppins, sans-serif' }}>
                Leaderboards by Difficulty
              </p>
              <p className="mt-1 text-sm text-black font-semibold">
                {user ? `Signed in as ${user.email}` : 'Public leaderboards — top 3 per difficulty'}
              </p>
            </div>

            <div className="flex rounded-l-sm rounded-r-sm bg-gradient-to-r from-yellow-400 to-pink-400 text-white  transition-transform r w-13 font-bold text-center justify-center justify-items-center ">
              <button onClick={() => router.push('/difficulty')} className=" shadow hover:scale-105 transition-transform text-center ">
                Home
              </button>
              
            </div>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFICULTIES.map(d => {
              const top3 = topForDifficulty(d.key, 3);
              return (
                <div key={d.key} className=" bg-white/85 backdrop-blur-sm border border-white/60 shadow-lg p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-extrabold text-black text-center">{d.label}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-l-sm rounded-l-sm text-sm font-bold w-20 text-center bg-gradient-to-r ${d.color} text-white`}>{d.label}</div>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <PodiumSmall list={top3} />
                  </div>
                  <hr className='border-t-4'></hr>
                  <div className="space-y-3">
                    {top3.length === 0 ? (
                      <div className="text-center text-sm text-gray-600 py-4">No players yet</div>
                    ) : (
                      top3.map((p, idx) => (
                        <div key={p.uid} className="flex items-center justify-center justify-between gap-4 bg-white/60 rounded-lg p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center shadow-sm text-lg">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-black truncate">{p.displayName || p.email || 'Player'}</div>
                              <div className="text-xs text-black truncate">{p.email || '—'}</div>
                            </div>
                          </div>
                          <div className="text-sm flex justify-center justify-items-center font-extrabold text-gray-900">{p.topScore}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 text-xs text-gray-500 text-center">Updated: {top3[0]?.updatedAt ? new Date(top3[0]!.updatedAt!).toLocaleString() : '—'}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10  justify-center  bg-white/80 border border-white/60 shadow p-6">
            <p className="text-sm font-bold text-gray-800 mb-4">All leaderboard entries </p>
            <hr></hr>
            {isLoading ? (
              <div className="py-6 text-center text-gray-600">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-sm text-gray-600">No entries in the leaderboard collection yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto justify-center justify-items-center">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-xs text-yellow-300">Rank</th>
                      <th className="px-3 py-2 text-xs text-yellow-300 ">Player</th>
                      <th className="px-3 py-2 text-xs text-yellow-300">Difficulty</th>
                      <th className="px-3 py-2 text-xs text-yellow-300 text-right flex">Top Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={e.uid} className="border-t text-black">
                        <td className="px-3 py-3 text-sm font-semibold">{i + 1}</td>
                        <td className="px-3 py-3 text-sm">{e.displayName || e.email || 'Player'}</td>
                        <td className="px-3 py-3 text-sm">{e.difficulty || '—'}</td>
                        <td className="px-3 py-3 text-sm font-extrabold text-right flex">{e.topScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
