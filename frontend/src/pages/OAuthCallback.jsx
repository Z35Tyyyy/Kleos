import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userRaw = searchParams.get('user');

        if (accessToken && userRaw) {
            try {
                const userData = JSON.parse(userRaw);
                // Call context auth login (which persists directly to localStorage)
                loginUser(accessToken, userData, refreshToken);
                
                // Route into the app
                navigate('/dashboard', { replace: true });
            } catch (err) {
                console.error("OAuth parse error:", err);
                setError('Failed to securely parse authentication matrix: ' + (err.message || String(err)));
            }
        } else {
            setError('Authentication tokens are missing from the response.');
        }
    }, [searchParams, navigate, loginUser]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface text-error p-6">
                <div className="glass-panel p-12 text-center rounded-2xl max-w-lg">
                    <span className="material-symbols-outlined text-[64px] mb-4">gpp_maybe</span>
                    <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="mt-8 bg-surface-container-highest px-6 py-3 rounded-lg text-on-surface hover:text-primary transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-12 h-12 bg-primary rounded-full"></div>
                </div>
                <h2 className="mt-8 text-on-surface font-bold tracking-widest uppercase text-sm">
                    Synthesizing Identity...
                </h2>
            </div>
        </div>
    );
};

export default OAuthCallback;
