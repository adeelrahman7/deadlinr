import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

function navClass({ isActive }) {
    return isActive
    ? 'text-sm font-medium text-blue-600'
    : 'text-sm text-gray-600 hover:text-gray-900';
}

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-900">deadlinr</span>
                <NavLink to="/" end className={navClass}>
                This Week
                </NavLink>
                <NavLink to="/courses" className={navClass}>
                Courses
                </NavLink>
            </div>
            <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-gray-600">{user.email}</span>
                <button onClick={logout} className="text-sm text-gray-700 hover:text-red-600">
                Log out
                </button>
            </div>
            </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
            <Outlet />
        </main>
        </div>
    );
}