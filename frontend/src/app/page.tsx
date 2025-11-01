"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { firebaseAuth } from "@/app/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Banana Trivia</h1>
        <nav className="flex items-center gap-3">
          <Link href="/leaderboard" className="underline">Leaderboard</Link>
          {user ? (
            <button onClick={() => signOut(firebaseAuth)} className="border rounded px-3 py-1">Sign out</button>
          ) : (
            <>
              <Link href="/signin" className="border rounded px-3 py-1">Sign in</Link>
              <Link href="/signup" className="border rounded px-3 py-1">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto mt-16 grid gap-8">
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-semibold">Solve banana puzzles fast</h2>
          <p className="text-gray-600">Answer correctly before the timer runs out. Climb levels and the leaderboard.</p>
          <Link href="/game" className="inline-block bg-black text-white px-6 py-3 rounded">Play now</Link>
        </section>
      </main>
    </div>
  );
}
