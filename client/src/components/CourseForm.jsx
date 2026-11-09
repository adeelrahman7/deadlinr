import { useState } from 'react';
import { getErrorMessage } from '../api/client';

export default function CourseForm({ initial, onSubmit, onCancel, submitLabel = 'Add course' }) {
    const [name, setName] = useState(initial?.name ?? '');
    const [color, setColor] = useState(initial?.color ?? '#3b82f6');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
        await onSubmit({ name, color });
        if (!initial) setName(''); // clear the form after adding, not after editing
        } catch (err) {
        setError(getErrorMessage(err));
        } finally {
        setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
            title="Course color"
        />
        <input
            type="text"
            required
            placeholder="Course name, e.g. CS 3360"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-48 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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