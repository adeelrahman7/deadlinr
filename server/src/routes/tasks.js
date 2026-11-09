import { Router } from 'express';
import { z } from 'zod';
import pool from '../db/pool.js';
import requireAuth from '../middleware/requireAuth.js';
import { sendValidationError, parseId } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const TASK_TYPES = ['assignment', 'exam', 'quiz', 'other'];

const taskFields = {
    course_id: z.number().int().positive(),
    title: z.string().trim().min(1, 'Title is required').max(200),
    type: z.enum(TASK_TYPES),
    due_date: z.coerce.date(),
    done: z.boolean(),
};

const createTaskSchema = z.object({
    ...taskFields,
    type: taskFields.type.default('assignment'),
    done: taskFields.done.optional(),
});

const updateTaskSchema = z
    .object(taskFields)
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
    });

const listQuerySchema = z.object({
    course_id: z.coerce.number().int().positive().optional(),
    done: z.enum(['true', 'false']).optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
});

const TASK_COLUMNS =
    'id, course_id, title, type, due_date, done, created_at';

async function userOwnsCourse(courseId, userId) {
    const result = await pool.query(
    'SELECT 1 FROM courses WHERE id = $1 AND user_id = $2',
    [courseId, userId]
    );
    return result.rowCount > 0;
}

// GET /api/tasks?course_id=&done=&start=&end=
    router.get('/', async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendValidationError(res, parsed);

    const { course_id, done, start, end } = parsed.data;
    const conditions = ['t.user_id = $1'];
    const params = [req.user.id];

    if (course_id !== undefined) {
        params.push(course_id);
        conditions.push(`t.course_id = $${params.length}`);
    }
    if (done !== undefined) {
        params.push(done === 'true');
        conditions.push(`t.done = $${params.length}`);
    }
    if (start) {
        params.push(start);
        conditions.push(`t.due_date >= $${params.length}`);
    }
    if (end) {
        params.push(end);
        conditions.push(`t.due_date < $${params.length}`);
    }

    const result = await pool.query(
        `SELECT t.id, t.course_id, t.title, t.type, t.due_date, t.done, t.created_at,
                c.name AS course_name, c.color AS course_color
        FROM tasks t
        LEFT JOIN courses c ON c.id = t.course_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY t.due_date ASC`,
        params
    );
    res.json({ tasks: result.rows });
});

// POST /api/tasks
router.post('/', async (req, res) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed);

    const { course_id, title, type, due_date, done } = parsed.data;

    if (!(await userOwnsCourse(course_id, req.user.id))) {
        return res.status(404).json({ error: 'Course not found' });
    }

    const result = await pool.query(
        `INSERT INTO tasks (user_id, course_id, title, type, due_date, done)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ${TASK_COLUMNS}`,
        [req.user.id, course_id, title, type, due_date, done ?? false]
    );
    res.status(201).json({ task: result.rows[0] });
    });

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Task not found' });

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed);

    const { course_id, title, type, due_date, done } = parsed.data;

    if (course_id !== undefined && !(await userOwnsCourse(course_id, req.user.id))) {
        return res.status(404).json({ error: 'Course not found' });
    }

    const result = await pool.query(
    `UPDATE tasks
        SET course_id = COALESCE($1, course_id),
            title     = COALESCE($2, title),
            type      = COALESCE($3, type),
            due_date  = COALESCE($4, due_date),
            done      = COALESCE($5, done)
        WHERE id = $6 AND user_id = $7
        RETURNING ${TASK_COLUMNS}`,
    [
        course_id ?? null,
        title ?? null,
        type ?? null,
        due_date ?? null,
        done ?? null,
        id,
        req.user.id,
        ]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: result.rows[0] });
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Task not found' });

    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).end();
});

export default router;