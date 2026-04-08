import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const data = await login(email, password);
                loginUser(data.token, data.user);
            } else {
                const data = await register(name, email, password);
                loginUser(data.token, data.user);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-surface-container-lowest font-['Plus_Jakarta_Sans'] text-on-surface selection:bg-primary/30">
            
            {/* Left Side: Visual Panel */}
            <div className="hidden lg:flex flex-[6] relative overflow-hidden p-16 items-center justify-center border-r border-outline-variant/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 blur-[150px] animate-pulse-slow"></div>
                
                <div className="glass-panel p-12 text-center max-w-lg rounded-2xl border border-outline-variant/10 z-10">
                    <span className="material-symbols-outlined text-[64px] text-primary mb-6">description</span>
                    <h2 className="text-4xl font-extrabold tracking-tighter mb-4">Where AI Meets Your Career</h2>
                    <p className="text-on-surface-variant font-light leading-relaxed">
                        Step into the future of job applications with context-aware AI resume optimization.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-[4] bg-surface flex flex-col justify-center p-8 md:p-16 relative">
                
                <Link to="/" className="absolute top-8 left-8 md:left-16 text-on-surface-variant hover:text-primary flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Home
                </Link>

                <div className="w-full max-w-md mx-auto mt-12">
                    <div className="text-2xl font-extrabold tracking-tighter text-white mb-10 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Kleos
                    </div>

                    <div className="flex gap-4 mb-8 border-b border-outline-variant/10 relative">
                        <button 
                            className={`pb-2 font-bold transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`pb-2 font-bold transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="bg-error-container/20 text-error p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {!isLogin && (
                            <div className="relative">
                                <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 text-on-surface-variant text-sm">person</span>
                                <input 
                                    className="w-full bg-surface-container border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-on-surface focus:outline-none focus:border-primary/40 transition-colors"
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                        )}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 text-on-surface-variant text-sm">mail</span>
                            <input 
                                className="w-full bg-surface-container border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-on-surface focus:outline-none focus:border-primary/40 transition-colors"
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 text-on-surface-variant text-sm">lock</span>
                            <input 
                                className="w-full bg-surface-container border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-on-surface focus:outline-none focus:border-primary/40 transition-colors"
                                type="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button 
                            className="w-full py-4 mt-2 bg-gradient-to-r from-primary to-[#FF6B8B] text-on-primary-fixed font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_10px_25px_rgba(255,45,85,0.2)]"
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-outline-variant/10"></div>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant">or</span>
                        <div className="flex-1 h-px bg-outline-variant/10"></div>
                    </div>

                    <a 
                        href="http://localhost:3000/auth/google" 
                        className="w-full py-4 bg-surface-container-high border border-outline-variant/10 text-on-surface font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"/>
                            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"/>
                            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"/>
                            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"/>
                        </svg>
                        Continue with Google
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Auth;
