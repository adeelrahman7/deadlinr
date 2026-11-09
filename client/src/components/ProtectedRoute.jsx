import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <p className="p-8 text-gray-500">Loading...</p>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}