import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { localInputToISO, isoToLocalInput } from '../utils/dates';

const TASK_TYPES = ['assignment', 'exam', 'quiz', 'other'];

export default function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Add task' }) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [type, setType] = useState(initial?.type ?? 'assignment');
    const [due, setDue] = useState(initial ? isoToLocalInput(initial.due_date) : '');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
        await onSubmit({ title, type, due_date: localInputToISO(due) });
        if (!initial) {
            setTitle('');
            setDue('');
        }
        } catch (err) {
        setError(getErrorMessage(err));
        } finally {
        setSubmitting(false);
        }
    }

    const inputClass =
        'rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
            type="text"
            required
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`flex-1 min-w-48 ${inputClass}`}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
            </option>
            ))}
        </select>
        <input
            type="datetime-local"
            required
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className={inputClass}
        />
        <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
            {submitLabel}
        </button>
        {onCancel && (
            <button type="button" onClick={onCancel} className="px-3 py-2 text-gray-600 hover:text-gray-900">
            Cancel
            </button>
        )}
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
    );
    }