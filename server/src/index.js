import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db/pool.js';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import taskRoutes from './routes/tasks.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT now()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);

// Error handler: must be after all routes
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});