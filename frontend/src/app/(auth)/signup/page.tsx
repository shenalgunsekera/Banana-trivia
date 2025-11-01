"use client";
import { useState } from "react";
import { firebaseAuth } from "@/app/utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account? <Link href="/signin" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}


