import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db/pool.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
});

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid input',
      details: parsed.error.issues.map((i) => i.message),
    });
  }

  const { email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err; // Express 5 passes this to its default error handler
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const { email, password } = parsed.data;
  const result = await pool.query(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  const row = result.rows[0];

  const valid = row && (await bcrypt.compare(password, row.password_hash));
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = { id: row.id, email: row.email, created_at: row.created_at };
  res.json({ token: signToken(user), user });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

export default router;