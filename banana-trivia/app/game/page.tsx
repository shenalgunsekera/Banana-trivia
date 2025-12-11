'use client';

import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import BackgroundBlobs from '../../components/BackgroundBlobs';
import LoadingScreen from '../../components/LoadingScreen';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { DIFFICULTY_CONFIGS, API_CONFIG, GAME_CONFIG, type Difficulty } from '../../constants/game';
import { formatTime, calculateProgress } from '../../utils/time';

type LeaderboardEntry = {
  uid: string;
  displayName?: string;
  email?: string;
  topScore: number;
  updatedAt?: string;
  difficulty?: string;
};

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'medium') as Difficulty;
  const { user, loading } = useAuth();

  const settings = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;

  // Game state
  const [question, setQuestion] = useState<string>('');
  const [solution, setSolution] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [timer, setTimer] = useState<number>(settings.timer);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [topScores, setTopScores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnsweredWrong, setHasAnsweredWrong] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Public leaderboard entries (top N)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const LEADERBOARD_LIMIT = 10;

  // Fetch a question (image + numeric solution)
  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      setImageLoaded(false);
      setError(null);

      const response = await axios.get(API_CONFIG.BASE_URL, { timeout: API_CONFIG.TIMEOUT });

      if (response.data && response.data.question && typeof response.data.solution === 'number') {
        setQuestion(response.data.question);
        setSolution(response.data.solution);

        setTimeout(() => {
          setImageLoaded(true);
          setIsLoading(false);
        }, API_CONFIG.IMAGE_LOAD_TIMEOUT);
      } else {
        throw new Error('Invalid question format received from API');
      }
    } catch (err: any) {
      console.error('fetchQuestion error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load question. Please try again.';
      setError(errorMessage.includes('timeout') ? 'Request timed out. Please check your connection and try again.' : 'Failed to load question. Please try again.');
      setIsLoading(false);
      setImageLoaded(true);
    }
  };

  // Load user's private topScores
  const loadTopScores = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as any;
        setTopScores(Array.isArray(data.topScores) ? data.topScores : []);
      } else {
        setTopScores([]);
      }
    } catch (err) {
      console.error('Error loading top scores:', err);
    }
  };

  // Fetch public leaderboard (leaderboard collection) and sort locally
  const fetchLeaderboard = async () => {
    try {
      const snap = await getDocs(collection(db, 'leaderboard'));
      const entries: LeaderboardEntry[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data() as any;
        entries.push({
          uid: docSnap.id,
          displayName: d.displayName || d.name || '',
          email: d.email || '',
          topScore: typeof d.topScore === 'number' ? d.topScore : 0,
          updatedAt: d.updatedAt || '',
          difficulty: d.difficulty || ''
        });
      });

      entries.sort((a, b) => b.topScore - a.topScore);
      setLeaderboard(entries.slice(0, LEADERBOARD_LIMIT));
    } catch (err: any) {
      console.error('Error fetching public leaderboard:', err);
      // don't surface a fatal error here; keep leaderboard empty
      setLeaderboard([]);
    }
  };

  // Save score to both users/{uid} and leaderboard/{uid}
  const saveScore = async () => {
    if (!user?.uid) {
      console.warn('saveScore aborted: no user');
      return;
    }

    try {
      const newTopScores = [...topScores, score]
        .sort((a, b) => b - a)
        .slice(0, GAME_CONFIG.MAX_TOP_SCORES);

      // update private user doc
      await setDoc(doc(db, 'users', user.uid), { topScores: newTopScores }, { merge: true });

      // prepare public leaderboard entry (minimal)
      const publicEntry = {
        uid: user.uid,
        displayName: (user as any)?.displayName || user.email?.split('@')[0] || 'Player',
        email: user.email || '',
        topScore: newTopScores.length ? Math.max(...newTopScores) : 0,
        updatedAt: new Date().toISOString(),
        difficulty: difficulty
      };

      // write to public leaderboard (requires owner write in rules)
      await setDoc(doc(db, 'leaderboard', user.uid), publicEntry, { merge: true });

      setTopScores(newTopScores);
      console.log('Score saved and leaderboard updated', publicEntry);

      // refresh public leaderboard so podium updates immediately
      await fetchLeaderboard();
    } catch (err: any) {
      console.error('Error saving score or updating leaderboard:', err);
      if (err?.code === 'permission-denied') {
        setError('Permission denied writing leaderboard: check Firestore rules for leaderboard writes.');
      }
    }
  };


  const handleSubmit = async () => {
    try {
      if (solution === null || typeof solution === 'undefined') {
        console.warn('Submit aborted: solution not ready', { solution });
        setError('Solution not ready yet. Please wait a moment.');
        return;
      }

      const userAnswer = parseInt(answer as any, 10);
      if (isNaN(userAnswer)) {
        console.warn('Submit aborted: invalid number', { answer });
        setError('Please enter a valid number as your answer.');
        return;
      }

      console.log('Submitting answer', { userAnswer, solution });

      const isAnswerCorrect = userAnswer === solution && !hasAnsweredWrong;
      setIsCorrect(isAnswerCorrect);

      if (isAnswerCorrect) {
        setScore(prev => prev + 1);
      } else if (!hasAnsweredWrong) {
        setHasAnsweredWrong(true);
      }

      setTimeout(async () => {
        if (currentQuestion < settings.questions - 1) {
          setCurrentQuestion(prev => prev + 1);
          setAnswer('');
          setIsCorrect(null);
          setHasAnsweredWrong(false);
          setError(null);
          await fetchQuestion();
        } else {
          setGameOver(true);
          await saveScore();
        }
      }, GAME_CONFIG.FEEDBACK_DELAY);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Something went wrong submitting your answer. Try again.');
    }
  };

  // Warn on refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You will be logged out if you refresh or close this page. Your progress will be lost!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Initialize game & leaderboard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const initGame = async () => {
        setCurrentQuestion(0);
        setScore(0);
        setGameOver(false);
        setHasAnsweredWrong(false);
        setAnswer('');
        setIsCorrect(null);
        setError(null);
        setTimer(settings.timer);
        await fetchQuestion();
        await loadTopScores();
        await fetchLeaderboard();
      };

      initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, difficulty]);

  // Timer effect
  useEffect(() => {
    if (!gameOver && !loading && user && timer > 0) {
      const id = setInterval(() => {
        setTimer((t) => (t <= 1 ? 0 : t - 1));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [gameOver, loading, user, timer]);

  // Handle time up
  useEffect(() => {
    if (timer === 0 && !gameOver && !loading && user) {
      setGameOver(true);
      saveScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, gameOver, loading, user]);

  if (loading || !user) {
    return <LoadingScreen bgColor={settings.bgColor} />;
  }

  const progressPercentage = calculateProgress(currentQuestion + 1, settings.questions);
  const timerWarning = timer <= GAME_CONFIG.TIMER_WARNING_THRESHOLD;

  // Helper: render small podium preview (top 3)
  const renderMiniPodium = () => {
    const top3 = leaderboard.slice(0, 3);
    return (
      <div className="flex items-end gap-3">
        {top3.map((p, idx) => {
          const heights = ['h-16', 'h-20', 'h-14']; // visual order will place 2nd,1st,3rd via CSS if needed
          const labels = ['🥈', '🥇', '🥉']; // we'll map index visually below
          // map display order: idx 0 -> 2nd, 1 -> 1st, 2 -> 3rd is awkward since slice keeps order desc.
          // We'll render as [2nd, 1st, 3rd] by rearranging indices: [1,0,2]
          return null;
        })}
        {/* Render explicitly in order 2nd, 1st, 3rd */}
        <div className="flex items-end gap-3">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            {leaderboard[1] ? (
              <>
                <div className="w-12 rounded-t-lg bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center border-2 border-white/80">{'🥈'}</div>
                <div className="w-12 h-10 bg-white/90 flex items-center justify-center text-sm font-bold text-gray-800 rounded-b-lg shadow">{leaderboard[1].topScore}</div>
              </>
            ) : (
              <div className="w-12 h-20 bg-white/90 rounded-lg flex items-center justify-center text-xs text-gray-400">—</div>
            )}
            <div className="mt-1 text-xs text-gray-600 max-w-[72px] truncate text-center">{leaderboard[1]?.displayName || '—'}</div>
          </div>

          {/* 1st place (taller) */}
          <div className="flex flex-col items-center">
            {leaderboard[0] ? (
              <>
                <div className="w-16 rounded-t-lg bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center border-2 border-white/80">{'🥇'}</div>
                <div className="w-16 h-12 bg-white/90 flex items-center justify-center text-sm font-extrabold text-gray-900 rounded-b-lg shadow">{leaderboard[0].topScore}</div>
              </>
            ) : (
              <div className="w-16 h-26 bg-white/90 rounded-lg flex items-center justify-center text-xs text-gray-400">—</div>
            )}
            <div className="mt-1 text-xs text-gray-600 max-w-[96px] truncate text-center">{leaderboard[0]?.displayName || '—'}</div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center">
            {leaderboard[2] ? (
              <>
                <div className="w-12 rounded-t-lg bg-gradient-to-b from-orange-300 to-orange-400 flex items-center justify-center border-2 border-white/80">{'🥉'}</div>
                <div className="w-12 h-10 bg-white/90 flex items-center justify-center text-sm font-bold text-gray-800 rounded-b-lg shadow">{leaderboard[2].topScore}</div>
              </>
            ) : (
              <div className="w-12 h-20 bg-white/90 rounded-lg flex items-center justify-center text-xs text-gray-400">—</div>
            )}
            <div className="mt-1 text-xs text-gray-600 max-w-[72px] truncate text-center">{leaderboard[2]?.displayName || '—'}</div>
          </div>
        </div>
      </div>
    );
  };

  // Helper: render full podium for game over (bigger)
  const renderFullPodium = () => {
    const top3 = leaderboard.slice(0, 3);
    // heights for 1st/2nd/3rd
    const heights = ['h-40', 'h-32', 'h-24'];
    const colors = ['from-yellow-300 to-yellow-500', 'from-gray-300 to-gray-400', 'from-orange-300 to-orange-400'];

    return (
      <div className="flex justify-center items-end gap-6 md:gap-8 overflow-x-auto pb-2">
        {top3.map((entry, idx) => {
          // display order: 2nd (idx=1) , 1st (idx=0), 3rd (idx=2) to mimic classic podium layout
          let displayIdx = idx;
          // We'll map to [1,0,2] ordering when rendering below by constructing an array
          return null;
        })}
        {/* custom order: second, first, third */}
        <div className="flex items-end gap-6">
          {/* 2nd */}
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
            <div className="text-sm mb-2 font-bold text-gray-800">2nd</div>
            <div className={`w-28 ${heights[1]} rounded-t-2xl bg-gradient-to-b ${colors[1]} flex flex-col justify-end items-center shadow-2xl border-4 border-white/80`}>
              <div className="bg-white/95 w-full p-3 rounded-t-xl text-center">
                <div className="font-extrabold text-gray-800">{top3[1]?.topScore ?? '—'}</div>
                <div className="text-xs text-gray-600 truncate">{top3[1]?.displayName ?? 'Player'}</div>
              </div>
            </div>
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
            <div className="text-sm mb-2 font-bold text-gray-800">1st</div>
            <div className={`w-36 ${heights[0]} rounded-t-2xl bg-gradient-to-b ${colors[0]} flex flex-col justify-end items-center shadow-2xl border-4 border-white/80`}>
              <div className="bg-white/95 w-full p-4 rounded-t-xl text-center">
                <div className="font-extrabold text-2xl text-gray-800">{top3[0]?.topScore ?? '—'}</div>
                <div className="text-sm text-gray-600 truncate">{top3[0]?.displayName ?? 'Player'}</div>
              </div>
            </div>
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
            <div className="text-sm mb-2 font-bold text-gray-800">3rd</div>
            <div className={`w-24 ${heights[2]} rounded-t-2xl bg-gradient-to-b ${colors[2]} flex flex-col justify-end items-center shadow-2xl border-4 border-white/80`}>
              <div className="bg-white/95 w-full p-2.5 rounded-t-xl text-center">
                <div className="font-extrabold text-gray-800">{top3[2]?.topScore ?? '—'}</div>
                <div className="text-xs text-gray-600 truncate">{top3[2]?.displayName ?? 'Player'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Play — Banana Trivia</title>
      </Head>

      <div className={`relative w-full min-h-screen ${settings.bgColor} overflow-hidden`}>
        <Image src="/images/landing-bg.png" alt="Background" fill priority className="object-cover opacity-30" />
        <BackgroundBlobs opacity={20} showThirdBlob={false} />

        <div className="relative z-10 flex flex-col items-center p-6 sm:p-8 md:p-10 min-h-screen py-12 sm:py-16 md:py-20 space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header + mini podium */}
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <div className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${settings.color} bg-clip-text text-transparent`}>
                {difficulty.toUpperCase()}
              </div>
              <div className="mt-2 text-sm sm:text-base font-bold bg-white/80 inline-block px-4 py-2 rounded-full text-gray-700">
                Level {currentQuestion + 1}/{settings.questions}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div role="timer" aria-live="polite" className={`text-2xl sm:text-3xl md:text-4xl font-black px-5 py-3 rounded-full ${timerWarning ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90'}`}>
                {formatTime(timer)}
              </div>

              <button onClick={() => router.push('/leaderboard')} className="px-4 py-2 rounded-full bg-white text-gray-800 font-bold shadow-md hover:shadow-lg transition-all">
                View Leaderboard
              </button>

              {/* mini podium preview */}
              <div className="hidden sm:flex items-center ml-4">
                {renderMiniPodium()}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-5xl">
            <div className="w-full bg-white/40 rounded-full h-3 sm:h-4 overflow-hidden backdrop-blur-md">
              <div className={`h-full bg-gradient-to-r ${settings.color} rounded-full transition-all duration-300 ease-out`} style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {/* QUESTION CARD */}
          {!gameOver ? (
            <div key={currentQuestion} className={`bg-gradient-to-br ${settings.color} rounded-3xl p-8 sm:p-10 md:p-12 w-full max-w-3xl shadow-2xl backdrop-blur-sm border-4 border-white/50 space-y-6`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center">{hasAnsweredWrong ? "🔒 Score Locked!" : "🤔 Solve This!"}</h2>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 md:p-10 min-h-[250px] flex items-center justify-center border-4 border-white/80 shadow-inner">
                {isLoading && !imageLoaded ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin text-5xl">🍌</div>
                    <div>
                      <p className="text-lg font-bold text-gray-600">Loading question...</p>
                      <p className="text-sm text-gray-500">This may take a moment</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center space-y-4">
                    <p className="text-lg text-red-500 font-bold">❌ {error}</p>
                    <button onClick={() => fetchQuestion()} className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-bold">Retry</button>
                  </div>
                ) : question ? (
                  <div className="w-full flex justify-center">
                    <img
                      src={question}
                      alt={`Question ${currentQuestion + 1}`}
                      onLoad={() => { setImageLoaded(true); setIsLoading(false); }}
                      onError={() => { setError('Failed to load question image.'); setImageLoaded(true); setIsLoading(false); }}
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                      loading="eager"
                      className="drop-shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg text-gray-500 font-semibold">No question available</p>
                  </div>
                )}
              </div>

              {isCorrect !== null && (
                <div className={`p-5 rounded-xl font-bold text-white text-center text-lg ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
                </div>
              )}

              <div className="flex flex-col items-center space-y-4">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && imageLoaded && answer && isCorrect === null) handleSubmit(); }}
                  placeholder="Enter your answer..."
                  className="w-full max-w-md p-5 text-lg sm:text-xl rounded-xl border-4 border-white/80 focus:outline-none bg-white/90"
                  autoFocus
                  disabled={!imageLoaded || isCorrect !== null}
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!imageLoaded || answer.trim() === '' || isCorrect !== null}
                  className="bg-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text px-12 sm:px-16 py-4 sm:py-5 rounded-full text-xl sm:text-2xl md:text-3xl font-black hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-lg border-4 border-white/80"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            /* GAME OVER CARD with full podium */
            <div className={`bg-gradient-to-br ${settings.color} rounded-3xl p-8 sm:p-10 md:p-12 w-full max-w-3xl shadow-2xl backdrop-blur-sm border-4 border-white/50 space-y-8`}>
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg animate-bounce">
                  🎉 Game Complete!
                </h2>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg">
                  Final Score: <span className="text-3xl sm:text-4xl md:text-5xl">{score}/{settings.questions}</span>
                </p>
              </div>

              {hasAnsweredWrong && (
                <p className="text-center text-white font-bold bg-black/20 p-4 sm:p-5 rounded-xl text-sm sm:text-base md:text-lg">
                  You made a mistake, but completed the challenge! 💪
                </p>
              )}

              {/* Full podium */}
              <div className="flex justify-center">{renderFullPodium()}</div>

              {/* Buttons */}
              <div className="space-y-4 sm:space-y-5">
                <button onClick={() => { setGameOver(false); setCurrentQuestion(0); setScore(0); setHasAnsweredWrong(false); setAnswer(''); setIsCorrect(null); setTimer(settings.timer); fetchQuestion(); }} className="w-full p-4 sm:p-5 md:p-6 bg-white text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text font-black rounded-xl text-lg sm:text-xl md:text-2xl hover:scale-105 transition-transform drop-shadow-lg border-4 border-white/80">
                  Play Again
                </button>

                <button onClick={() => router.push('/leaderboard')} className="w-full p-4 sm:p-5 md:p-6 bg-white text-gray-700 font-black rounded-xl text-lg sm:text-xl md:text-2xl hover:scale-105 transition-transform drop-shadow-lg border-4 border-white/80">
                  View Leaderboard
                </button>

                <button onClick={() => router.push('/')} className="w-full p-4 sm:p-5 md:p-6 bg-white/80 text-gray-700 font-black rounded-xl text-lg sm:text-xl md:text-2xl hover:scale-105 transition-transform drop-shadow-lg border-4 border-white/80">
                  Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
