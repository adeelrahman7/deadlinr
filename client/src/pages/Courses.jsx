import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/courses';
import { getErrorMessage } from '../api/client';
import CourseForm from '../components/CourseForm';

function sortByName(courses) {
    return [...courses].sort((a, b) => a.name.localeCompare(b.name));
    }

    export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        getCourses()
        .then(setCourses)
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, []);

    async function handleCreate(data) {
        const course = await createCourse(data);
        setCourses((prev) => sortByName([...prev, course]));
    }

    async function handleUpdate(id, data) {
        const updated = await updateCourse(id, data);
        setCourses((prev) => sortByName(prev.map((c) => (c.id === id ? updated : c))));
        setEditingId(null);
    }

    async function handleDelete(course) {
        if (!window.confirm(`Delete "${course.name}" and all of its tasks?`)) return;
        try {
        await deleteCourse(course.id);
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
        } catch (err) {
        setError(getErrorMessage(err));
        }
    }

    if (loading) return <p className="text-gray-500">Loading courses...</p>;

    return (
        <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
            <CourseForm onSubmit={handleCreate} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        {courses.length === 0 ? (
            <p className="text-gray-500">No courses yet. Add your first one above.</p>
        ) : (
            <ul className="space-y-2">
            {courses.map((course) => (
                <li key={course.id} className="bg-white p-4 rounded-xl border border-gray-200">
                {editingId === course.id ? (
                    <CourseForm
                    initial={course}
                    submitLabel="Save"
                    onSubmit={(data) => handleUpdate(course.id, data)}
                    onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <div className="flex items-center gap-3">
                    <span
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: course.color || '#9ca3af' }}
                    />
                    <Link
                        to={`/courses/${course.id}`}
                        className="flex-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                        {course.name}
                    </Link>
                    <button
                        onClick={() => setEditingId(course.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(course)}
                        className="text-sm text-gray-600 hover:text-red-600"
                    >
                        Delete
                    </button>
                    </div>
                )}
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}