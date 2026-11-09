import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getCourse } from '../api/courses';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

function sortByDue(tasks) {
    return [...tasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    export default function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        Promise.all([getCourse(id), getTasks({ course_id: id })])
        .then(([courseData, taskData]) => {
            setCourse(courseData);
            setTasks(taskData);
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, [id]);

    async function handleCreate(values) {
        const task = await createTask({ ...values, course_id: course.id });
        setTasks((prev) => sortByDue([...prev, task]));
    }

    async function handleUpdate(taskId, values) {
        const updated = await updateTask(taskId, values);
        setTasks((prev) => sortByDue(prev.map((t) => (t.id === taskId ? updated : t))));
        setEditingId(null);
    }

    async function handleToggle(task) {
        try {
        const updated = await updateTask(task.id, { done: !task.done });
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
        } catch (err) {
        setError(getErrorMessage(err));
        }
    }

    async function handleDelete(task) {
        if (!window.confirm(`Delete "${task.title}"?`)) return;
        try {
        await deleteTask(task.id);
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        } catch (err) {
        setError(getErrorMessage(err));
        }
    }

    if (loading) return <p className="text-gray-500">Loading...</p>;

    if (!course) {
        return (
        <div className="space-y-4">
            <p className="text-red-600">{error || 'Course not found'}</p>
            <Link to="/courses" className="text-blue-600 hover:underline">
            ← Back to courses
            </Link>
        </div>
        );
    }

    return (
        <div className="space-y-6">
        <div>
            <Link to="/courses" className="text-sm text-gray-500 hover:text-gray-900">
            ← Courses
            </Link>
            <div className="mt-2 flex items-center gap-3">
            <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: course.color || '#9ca3af' }}
            />
            <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
            <TaskForm onSubmit={handleCreate} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet for this course.</p>
        ) : (
            <ul className="space-y-2">
            {tasks.map((task) =>
                editingId === task.id ? (
                <li key={task.id} className="bg-white p-3 rounded-lg border border-blue-300">
                    <TaskForm
                    initial={task}
                    submitLabel="Save"
                    onSubmit={(values) => handleUpdate(task.id, values)}
                    onCancel={() => setEditingId(null)}
                    />
                </li>
                ) : (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={(t) => setEditingId(t.id)}
                    onDelete={handleDelete}
                />
                )
            )}
            </ul>
        )}
        </div>
    );
}