// "2026-11-04T09:00" (local, from a datetime-local input) → UTC ISO string for the API
export function localInputToISO(value) {
    return new Date(value).toISOString();
}

// UTC ISO string from the API → "YYYY-MM-DDTHH:mm" in local time, for prefilling an input
export function isoToLocalInput(iso) {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "Wed, Nov 4, 9:00 AM" in the user's timezone
export function formatDue(iso) {
    return new Date(iso).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function isOverdue(task) {
    return !task.done && new Date(task.due_date) < new Date();
}