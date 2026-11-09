export function sendValidationError(res, parsed) {
    return res.status(400).json({
    error: 'Invalid input',
    details: parsed.error.issues.map((i) =>
        i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message
    ),
    });
}

export function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}