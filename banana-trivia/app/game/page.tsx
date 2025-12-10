'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'medium';
  const { user, loading } = useAuth();
  
  const difficultySettings = {
    easy: { questions: 5, timer: 120, color: 'from-green-400 to-emerald-500', bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100' },
    medium: { questions: 10, timer: 60, color: 'from-yellow-400 to-orange-500', bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100' },
    hard: { questions: 15, timer: 40, color: 'from-red-400 to-pink-500', bgColor: 'bg-gradient-to-br from-red-100 to-pink-100' }
  };
  
  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;
  
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

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      setImageLoaded(false);
      setError(null);
      
      const response = await axios.get('https://marcconrad.com/uob/banana/api.php', {
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data && response.data.question) {
        setQuestion(response.data.question);
        setSolution(response.data.solution);
        
        // Set a timeout in case image fails to load
        const timeout = setTimeout(() => {
          setImageLoaded(true);
          setIsLoading(false);
        }, 2000); // Reduced from 3000 to 2000ms
        
        return () => clearTimeout(timeout);
      } else {
        throw new Error('Invalid question format received');
      }
    } catch (err) {
      setError('Failed to load question. Please try again.');
      console.error('Error fetching question:', err);
      setIsLoading(false);
      setImageLoaded(true);
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
        await fetchQuestion();
      } else {
        setGameOver(true);
        await saveScore();
      }
    }, 800);
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
          setTimer(settings.timer);
          await fetchQuestion();
          await loadTopScores();
        };
        initGame();
      }
    }
  }, [user, loading, difficulty]);

  // Timer effect - FIXED: Don't end game, let gameOver be set only by submission
  useEffect(() => {
    if (!gameOver && !loading && user && timer > 0) {
      const id = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(id);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [gameOver, loading, user]);

  // NEW: Handle time up - move to game over
  useEffect(() => {
    if (timer === 0 && !gameOver && !loading && user) {
      setGameOver(true);
      saveScore();
    }
  }, [timer, gameOver, loading, user]);

  // Loading screen
  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-yellow-100">
        <p className="text-2xl font-bold">Loading...</p>
      </div>
    );
  }

  const progressPercentage = ((currentQuestion + 1) / settings.questions) * 100;
  const timerWarning = timer <= 10;

  return (
    <div className={`relative w-full min-h-screen ${settings.bgColor} overflow-hidden`}>
      <Image
        src="/images/landing-bg.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-30"
      />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center p-8 min-h-screen py-16">
        {/* Header Section */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-black bg-gradient-to-r ${settings.color} bg-clip-text text-transparent`}>
                {difficulty.toUpperCase()}
              </div>
              <div className="text-sm font-bold bg-white/80 px-4 py-2 rounded-full text-gray-700">
                Level {currentQuestion + 1}/{settings.questions}
              </div>
            </div>
            <div className={`text-3xl font-black px-6 py-3 rounded-full ${timerWarning ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90'}`}>
              {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden backdrop-blur-md">
            <div 
              className={`h-full bg-gradient-to-r ${settings.color} rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {!gameOver ? (
          <div key={currentQuestion} className={`bg-gradient-to-br ${settings.color} rounded-3xl p-8 w-full max-w-3xl shadow-2xl backdrop-blur-sm border-4 border-white/50 transform transition-all duration-500 mb-8`}>
            {/* Title with animation */}
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-6 drop-shadow-lg">
              {hasAnsweredWrong ? "🔒 Score Locked!" : "🤔 Solve This!"}
            </h2>
            
            {/* Question Image Container */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 mb-6 min-h-[250px] md:min-h-[300px] flex items-center justify-center border-4 border-white/80 shadow-inner">
              {isLoading && !imageLoaded ? (
                <div className="text-center">
                  <div className="animate-spin text-5xl mb-4">🍌</div>
                  <p className="text-lg md:text-xl font-bold text-gray-600">Loading question...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <p className="text-lg md:text-xl text-red-500 mb-4 font-bold">❌ {error}</p>
                  <button 
                    onClick={() => fetchQuestion()}
                    className="px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-bold hover:scale-110 transition-transform"
                  >
                    Retry
                  </button>
                </div>
              ) : question ? (
                <div className="w-full flex justify-center transform transition-all duration-300">
                  <img 
                    src={question}
                    alt={`Question ${currentQuestion + 1}`}
                    onLoad={() => {
                      setImageLoaded(true);
                      setIsLoading(false);
                    }}
                    onError={() => {
                      setImageLoaded(true);
                      setIsLoading(false);
                    }}
                    style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }}
                    className="drop-shadow-lg"
                  />
                </div>
              ) : (
                <p className="text-lg text-gray-500">No question available</p>
              )}
            </div>

            {/* Answer Feedback */}
            {isCorrect !== null && (
              <div className={`mb-6 p-4 rounded-xl font-bold text-white text-center text-lg md:text-xl animate-bounce ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                {isCorrect ? '✅ Correct!' : '❌ Wrong! Keep going...'}
              </div>
            )}

            {/* Input and Button */}
            <div className="flex flex-col items-center space-y-3">
              <input 
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && imageLoaded && answer && handleSubmit()}
                placeholder="Enter your answer..."
                className="w-full max-w-md p-4 text-lg rounded-xl border-4 border-white/80 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/50 font-bold shadow-lg backdrop-blur-sm bg-white/90"
                autoFocus
                disabled={!imageLoaded || isCorrect !== null}
              />
              <button 
                onClick={handleSubmit}
                disabled={!imageLoaded || !answer || isCorrect !== null}
                className="bg-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text px-12 py-3 rounded-full text-xl md:text-2xl font-black hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 drop-shadow-lg border-4 border-white/80"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-br ${settings.color} rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl backdrop-blur-sm border-4 border-white/50 transform transition-all duration-500 mb-8`}>
            {/* Game Over Title */}
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4 drop-shadow-lg animate-bounce">
              🎉 Game Complete!
            </h2>
            <p className="text-center text-white text-lg md:text-xl font-bold mb-6 drop-shadow-lg">
              Final Score: <span className="text-3xl md:text-4xl">{score}/{settings.questions}</span>
            </p>

            {hasAnsweredWrong && (
              <p className="text-center text-white font-bold mb-6 bg-black/20 p-3 rounded-xl text-sm md:text-base">
                You made a mistake, but completed the challenge! 💪
              </p>
            )}

            {/* Podium */}
            <div className="flex justify-center items-end mb-8 space-x-2 md:space-x-4 overflow-x-auto pb-4">
              {[...topScores]
                .sort((a, b) => b - a)
                .slice(0, 3)
                .map((score, index) => {
                  const heights: Record<number, string> = {
                    0: 'h-40 md:h-48',
                    1: 'h-32 md:h-36',
                    2: 'h-24 md:h-28'
                  };
                  
                  const positions = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
                  const colors: Record<number, string> = {
                    0: 'from-yellow-300 to-yellow-500',
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
                      className="flex flex-col items-center transform hover:scale-110 transition-transform flex-shrink-0"
                      style={{ order: displayIndex }}
                    >
                      <div className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                        {score}/{settings.questions}
                      </div>
                      <div className={`${heights[index]} w-24 md:w-36 rounded-t-2xl bg-gradient-to-b ${colors[index]} 
                        flex flex-col justify-end items-center shadow-2xl transform hover:scale-105 transition-transform border-4 border-white/80`}
                      >
                        <div className="bg-white/95 w-full p-2 md:p-4 rounded-t-xl text-center">
                          <div className="font-black text-gray-800 text-sm md:text-lg">
                            {positions[index]}
                          </div>
                          <div className="text-xs text-gray-600 truncate px-1 font-bold">
                            {user?.email || 'Player'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/difficulty')}
                className="w-full p-3 md:p-4 bg-white text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text font-black rounded-xl text-lg md:text-xl hover:scale-105 transition-transform drop-shadow-lg border-4 border-white/80"
              >
                Play Again 🎮
              </button>
              <button 
                onClick={() => router.push('/')}
                className="w-full p-3 md:p-4 bg-white/80 text-gray-700 font-black rounded-xl text-lg md:text-xl hover:scale-105 transition-transform drop-shadow-lg border-4 border-white/80"
              >
                Home 🏠
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}