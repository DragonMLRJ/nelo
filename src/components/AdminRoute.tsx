import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="p-4 flex justify-center">Chargement...</div>;
    }

    if (!user || !user.isAdmin) {
        // Redirect to home if not admin, preserving the intended location in state if needed
        // But for security, maybe just 404 or home.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
