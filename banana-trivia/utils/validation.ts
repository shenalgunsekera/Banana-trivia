/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Gets user-friendly error message from Firebase error
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  };

  return errorMessages[error.code] || error.message || 'An error occurred. Please try again.';
}

