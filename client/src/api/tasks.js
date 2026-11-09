import api from './client';

export async function getTasks(params = {}) {
    const res = await api.get('/tasks', { params });
    return res.data.tasks;
}

export async function createTask(data) {
    const res = await api.post('/tasks', data);
    return res.data.task;
}

export async function updateTask(id, data) {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data.task;
}

export async function deleteTask(id) {
    await api.delete(`/tasks/${id}`);
}