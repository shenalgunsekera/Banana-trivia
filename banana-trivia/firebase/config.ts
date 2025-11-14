// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
let analytics: Analytics | null = null;
export const db = getFirestore(app);

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}