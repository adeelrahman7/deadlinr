import { Router } from 'express';
import { z } from 'zod';
import pool from '../db/pool.js';
import requireAuth from '../middleware/requireAuth.js';
import { sendValidationError, parseId } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex code like #3b82f6');

const createCourseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  color: hexColor.optional(),
});

const updateCourseSchema = createCourseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

// GET /api/courses
router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, color FROM courses WHERE user_id = $1 ORDER BY name',
    [req.user.id]
  );
  res.json({ courses: result.rows });
});

// POST /api/courses
router.post('/', async (req, res) => {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed);

  const { name, color } = parsed.data;
  const result = await pool.query(
    `INSERT INTO courses (user_id, name, color)
     VALUES ($1, $2, $3)
     RETURNING id, name, color`,
    [req.user.id, name, color ?? null]
  );
  res.status(201).json({ course: result.rows[0] });
});

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ error: 'Course not found' });

  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed);

  const { name, color } = parsed.data;
  const result = await pool.query(
    `UPDATE courses
     SET name = COALESCE($1, name),
         color = COALESCE($2, color)
     WHERE id = $3 AND user_id = $4
     RETURNING id, name, color`,
    [name ?? null, color ?? null, id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json({ course: result.rows[0] });
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ error: 'Course not found' });

  const result = await pool.query(
    'DELETE FROM courses WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.status(204).end();
});

export default router;