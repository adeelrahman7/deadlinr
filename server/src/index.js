import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());          // we'll restrict this to the Vercel URL on Day 7
app.use(express.json());  // parses JSON request bodies into req.body

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});