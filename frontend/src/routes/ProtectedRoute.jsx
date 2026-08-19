import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is authenticated but doesn't have the right role
        return <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
