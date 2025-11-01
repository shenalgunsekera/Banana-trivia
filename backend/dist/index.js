"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Firebase Admin initialization
if (!firebase_admin_1.default.apps.length) {
    try {
        const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        if (!serviceAccountJson) {
            console.warn('Firebase Admin not initialized: missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
        }
        else {
            const serviceAccount = JSON.parse(serviceAccountJson);
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
        }
    }
    catch (err) {
        console.error('Failed to initialize Firebase Admin', err);
    }
}
const db = firebase_admin_1.default.apps.length ? firebase_admin_1.default.firestore() : undefined;
// Proxy Banana API to avoid CORS and hide URL
app.get('/api/trivia', async (_req, res) => {
    try {
        const out = 'json';
        const base64 = 'no';
        const url = `http://marcconrad.com/uob/banana/api.php?out=${out}&base64=${base64}`;
        const response = await (0, node_fetch_1.default)(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trivia' });
    }
});
// Submit score
app.post('/api/submit-score', async (req, res) => {
    try {
        if (!db)
            return res.status(500).json({ error: 'Database not initialized' });
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
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('scores').add(doc);
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit score' });
    }
});
// Leaderboard: top N by score then shortest duration
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (!db)
            return res.status(500).json({ error: 'Database not initialized' });
        const limit = Number(req.query.limit || 20);
        // Firestore cannot order by two different fields with different directions easily; we fetch by score then sort
        const snap = await db
            .collection('scores')
            .orderBy('score', 'desc')
            .limit(limit * 3)
            .get();
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => {
            if (b.score !== a.score)
                return b.score - a.score;
            return (a.durationMs ?? 0) - (b.durationMs ?? 0);
        });
        res.json({ leaderboard: rows.slice(0, limit) });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
