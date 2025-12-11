
import { initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCFphfp3bhB1lQsCtsnmqQAnvsMxYmUHI",
  authDomain: "banana-trivia-shenal.firebaseapp.com",
  projectId: "banana-trivia-shenal",
  storageBucket: "banana-trivia-shenal.firebasestorage.app",
  messagingSenderId: "874481167345",
  appId: "1:874481167345:web:20ff343788e89fad2cb250",
  measurementId: "G-HV1MEF7TED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set session-only persistence (clears on refresh)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

let analytics: Analytics | null = null;
export const db = getFirestore(app);

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}