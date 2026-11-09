import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">deadlinr</span>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-red-600"
                >
                Log out
                </button>
            </div>
            </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-gray-900">This Week</h1>
            <p className="mt-2 text-gray-600">Your tasks will show up here.</p>
        </main>
        </div>
    );
}