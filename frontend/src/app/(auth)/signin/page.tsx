"use client";
import { useState } from "react";
import { firebaseAuth } from "@/app/utils/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <button onClick={onGoogle} className="w-full border rounded py-2">Continue with Google</button>
        <p className="text-center text-sm">
          No account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}


