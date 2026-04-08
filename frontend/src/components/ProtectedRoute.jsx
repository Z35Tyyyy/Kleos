import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
    if (!user) return <Navigate to="/auth" replace />;
    
    return children;
};
