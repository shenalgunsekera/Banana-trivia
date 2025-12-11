/**
 * Formats seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Calculates progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  return (current / total) * 100;
}

