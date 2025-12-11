export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  value: Difficulty;
  icon: string;
  questions: number;
  timer: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'EASY',
    emoji: '😊',
    description: '5 questions • 2 min timer',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
    value: 'easy',
    icon: '⭐',
    questions: 5,
    timer: 120,
  },
  medium: {
    name: 'MEDIUM',
    emoji: '😤',
    description: '10 questions • 1 min timer',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    value: 'medium',
    icon: '⭐⭐',
    questions: 10,
    timer: 60,
  },
  hard: {
    name: 'HARD',
    emoji: '🔥',
    description: '15 questions • 40 sec timer',
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-red-100 to-pink-100',
    value: 'hard',
    icon: '⭐⭐⭐',
    questions: 15,
    timer: 40,
  },
};

export const DIFFICULTIES: DifficultyConfig[] = Object.values(DIFFICULTY_CONFIGS);

export const API_CONFIG = {
  BASE_URL: 'https://marcconrad.com/uob/banana/api.php',
  TIMEOUT: 5000, // 5 seconds
  IMAGE_LOAD_TIMEOUT: 2000, // 2 seconds
} as const;

export const GAME_CONFIG = {
  MAX_TOP_SCORES: 3,
  TIMER_WARNING_THRESHOLD: 10, // seconds
  FEEDBACK_DELAY: 800, // milliseconds
} as const;

