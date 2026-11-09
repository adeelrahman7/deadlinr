import { formatDue, isOverdue } from '../utils/dates';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
    const overdue = isOverdue(task);

    return (
        <li
        className={`flex items-center gap-3 p-3 rounded-lg border ${
            overdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
        }`}
        >
        <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task)}
            className="h-4 w-4 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
            <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
            </p>
            <p className="text-sm text-gray-500">
            <span className="capitalize">{task.type}</span> · {formatDue(task.due_date)}
            {overdue && <span className="font-medium text-red-600"> · Overdue</span>}
            </p>
        </div>
        <button onClick={() => onEdit(task)} className="text-sm text-gray-600 hover:text-gray-900">
            Edit
        </button>
        <button onClick={() => onDelete(task)} className="text-sm text-gray-600 hover:text-red-600">
            Delete
        </button>
        </li>
    );
}