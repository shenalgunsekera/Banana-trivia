"use client";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  userName?: string;
  score: number;
  durationMs?: number;
  level?: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/leaderboard?limit=20");
        const data = await res.json();
        setRows(data.leaderboard || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="border rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{r.userName || "Anonymous"}</td>
                    <td className="px-4 py-2 font-medium">{r.score}</td>
                    <td className="px-4 py-2">{typeof r.durationMs === 'number' ? `${Math.round(r.durationMs / 1000)}s` : '-'}</td>
                    <td className="px-4 py-2">{r.level ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


