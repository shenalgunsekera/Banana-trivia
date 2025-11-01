import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin initialization
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!serviceAccountJson) {
      console.warn('Firebase Admin not initialized: missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
    } else {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin', err);
  }
}

const db = admin.apps.length ? admin.firestore() : undefined;

// Proxy Banana API to avoid CORS and hide URL
app.get('/api/trivia', async (_req: Request, res: Response) => {
  try {
    const out = 'json';
    const base64 = 'no';
    const url = `http://marcconrad.com/uob/banana/api.php?out=${out}&base64=${base64}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trivia' });
  }
});

// Submit score
app.post('/api/submit-score', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { userId, userName, score, level, durationMs } = req.body || {};
    if (!userId || typeof score !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const doc = {
      userId,
      userName: userName || 'Anonymous',
      score,
      level: level ?? 1,
      durationMs: durationMs ?? 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('scores').add(doc);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Leaderboard: top N by score then shortest duration
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const limit = Number(req.query.limit || 20);
    // Firestore cannot order by two different fields with different directions easily; we fetch by score then sort
    const snap = await db
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(limit * 3)
      .get();
    const rows = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
    rows.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.durationMs ?? 0) - (b.durationMs ?? 0);
    });
    res.json({ leaderboard: rows.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


