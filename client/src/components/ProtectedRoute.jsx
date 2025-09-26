import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
    const { isAuthenticated, userType } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        // Redirect to appropriate dashboard if user type doesn't match
        switch (userType) {
            case 'admin':
                return <Navigate to="/admin-dashboard" replace />;
            case 'manager':
                return <Navigate to="/manager-dashboard" replace />;
            case 'shopowner':
                return <Navigate to="/shopowner-dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;