'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';

export default function Game() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [question, setQuestion] = useState<string>('');
  const [solution, setSolution] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [topScores, setTopScores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnsweredWrong, setHasAnsweredWrong] = useState<boolean>(false);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('https://marcconrad.com/uob/smile/api.php');
      
      if (response.data && response.data.question) {
        setQuestion(response.data.question);
        setSolution(response.data.solution);
      } else {
        throw new Error('Invalid question format received');
      }
    } catch (err) {
      setError('Failed to load question. Please try again.');
      console.error('Error fetching question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopScores = async () => {
    if (!user?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setTopScores(data.topScores || []);
      }
    } catch (err) {
      console.error('Error loading top scores:', err);
    }
  };

  const saveScore = async () => {
    if (!user?.uid) return;

    try {
      const newTopScores = [...topScores, score]
        .sort((a, b) => b - a)
        .slice(0, 3);

      await setDoc(doc(db, 'users', user.uid), {
        topScores: newTopScores
      }, { merge: true });

      setTopScores(newTopScores);
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  const handleSubmit = async () => {
    if (!solution) return;

    const userAnswer = parseInt(answer);
    if (isNaN(userAnswer)) return;

    if (userAnswer === solution && !hasAnsweredWrong) {
      setScore(prev => prev + 1);
    } else if (!hasAnsweredWrong) {
      setHasAnsweredWrong(true);
    }
    
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1);
      setAnswer('');
      await fetchQuestion();
    } else {
      setGameOver(true);
      await saveScore();
    }
  };

  // Initialize game
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        const initGame = async () => {
          setCurrentQuestion(0);
          setScore(0);
          setGameOver(false);
          setTimer(60);
          await fetchQuestion();
          await loadTopScores();
        };
        initGame();
      }
    }
  }, [user, loading]);

  // Timer effect
  useEffect(() => {
    if (!gameOver && !loading && user) {
      const id = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setGameOver(true);
            clearInterval(id);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [gameOver, loading, user]);

  // Loading screen
  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-yellow-100">
        <p className="text-2xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-b from-yellow-200 to-yellow-300">
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-50"
      />

      <div className="relative z-10 flex flex-col items-center p-8">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Level {currentQuestion + 1}/10</h1>
          <div className="text-4xl font-bold">
            Timer {String(Math.floor(timer / 60)).padStart(2, '0')} : {String(timer % 60).padStart(2, '0')}
          </div>
        </div>

        {!gameOver ? (
          <div className="bg-yellow-400 rounded-3xl p-8 w-full max-w-3xl shadow-lg">
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              {hasAnsweredWrong ? "Continue playing, but your score is locked!" : "Solve..."}
            </h2>
            
            <div className="bg-white rounded-xl p-4 mb-8 min-h-[300px] flex items-center justify-center">
              {isLoading ? (
                <p className="text-xl">Loading question...</p>
              ) : error ? (
                <p className="text-xl text-red-500">{error}</p>
              ) : (
                <img 
                  src={question}
                  alt="Trivia Question"
                  className="max-w-full max-h-[280px] object-contain"
                />
              )}
            </div>

            <div className="flex flex-col items-center space-y-4">
              <input 
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full max-w-md p-4 text-xl rounded-lg border-2 border-yellow-500 focus:outline-none focus:border-yellow-600"
              />
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !answer}
                className="bg-white text-yellow-400 px-12 py-3 rounded-full text-2xl font-bold hover:bg-yellow-100 transition-colors disabled:opacity-50"
              >
                Finish
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-400 rounded-3xl p-8 w-full max-w-2xl">
            <div className="flex justify-center items-end mb-8 space-x-4">
              {[...topScores]
                .sort((a, b) => b - a)
                .slice(0, 3)
                .map((score, index) => {
                  const heights = {
                    0: 'h-44',
                    1: 'h-32',
                    2: 'h-24'
                  };
                  
                  const positions = ['1st', '2nd', '3rd'];
                  const colors = {
                    0: 'from-yellow-300 to-yellow-400',
                    1: 'from-gray-300 to-gray-400',
                    2: 'from-orange-300 to-orange-400'
                  };
                  
                  const displayIndex = {
                    0: 1,
                    1: 0,
                    2: 2
                  }[index];

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center"
                      style={{ order: displayIndex }}
                    >
                      <div className="text-3xl font-bold text-white mb-2">
                        {score}/10
                      </div>
                      <div className={`${heights[index as 0 | 1 | 2]} w-32 rounded-t-lg bg-linear-bb ${colors[index as 0 | 1 | 2]} 
                        flex flex-col justify-end items-center shadow-lg transform hover:scale-105 transition-transform`}
                      >
                        <div className="bg-white/90 w-full p-3 rounded-t-lg">
                          <div className="font-bold text-gray-800 text-center">
                            {positions[index]}
                          </div>
                          <div className="text-xs text-gray-600 text-center truncate px-1">
                            {user?.email || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <button 
              onClick={() => router.push('/')}
              className="w-full p-4 bg-white text-yellow-400 rounded-xl text-xl font-bold 
                hover:bg-yellow-50 transition-colors shadow-lg transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}