"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/app/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

type BananaResponse = {
  out: string;
  question: string; // image url
  solution: string | number;
  base64?: string;
};

export default function GamePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionUrl, setQuestionUrl] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [solution, setSolution] = useState<string | number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      if (!u) {
        router.push("/signin");
        return;
      }
      setUserId(u.uid);
      setUserName(u.displayName || undefined);
    });
    return () => unsub();
  }, [router]);

  // Load question per level
  async function loadQuestion() {
    setLoading(true);
    setError(null);
    setAnswer("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(baseUrl + "/api/trivia");
      const data: BananaResponse = await res.json();
      setQuestionUrl(data.question);
      setSolution(String(data.solution));
      setTimeLeft(Math.max(10, 30 - (level - 1) * 2));
      startedAtRef.current = Date.now();
    } catch (e: any) {
      setError("Failed to load question");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      // time up -> end run
      (async () => {
        await endRun(score);
        router.push("/leaderboard");
      })();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const difficultyLabel = useMemo(() => {
    if (level <= 3) return "Easy";
    if (level <= 6) return "Medium";
    return "Hard";
  }, [level]);

  async function submitAnswer() {
    if (solution == null) return;
    const correct = String(answer).trim() === String(solution).trim();
    const gained = correct ? 100 + Math.max(0, timeLeft) * 5 : 0;
    const newScore = score + gained;
    setScore(newScore);
    if (correct) {
      setLevel((l) => l + 1);
    } else {
      await endRun(newScore);
      router.push("/leaderboard");
    }
  }

  async function endRun(finalScore: number) {
    try {
      const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      await fetch(baseUrl + "/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, score: finalScore, level, durationMs }),
      });
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen p-6 grid place-items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Level {level} · {difficultyLabel}</div>
          <div className="text-sm">Time: <span className={timeLeft <= 5 ? "text-red-600" : ""}>{timeLeft}s</span></div>
          <div className="text-sm">Score: {score}</div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="border rounded p-4 grid gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : questionUrl ? (
            <div className="w-full grid place-items-center">
              {/* External image from Banana API */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={questionUrl} alt="Banana puzzle" className="max-h-[320px] object-contain" />
            </div>
          ) : null}

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
            />
            <button onClick={submitAnswer} className="bg-black text-white rounded px-4">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}


