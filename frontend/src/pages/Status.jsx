import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Status = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime] = useState(Date.now());

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/health`);
                const data = await response.json();
                if (response.ok) {
                    setStatus(data);
                } else {
                    throw new Error('Backend responded with an error');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [API_BASE_URL]);

    return (
        <div className="min-h-screen bg-surface-container-lowest font-['Plus_Jakarta_Sans'] text-on-surface selection:bg-primary/30 flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#FF6B8B]/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-2xl z-10">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </Link>
                    <div className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Kleos System Monitor
                    </div>
                </div>

                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-outline-variant/10 shadow-2xl backdrop-blur-xl bg-surface-container/40">
                    {loading ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="mt-6 text-on-surface-variant font-medium animate-pulse">Polling secure nodes...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-error text-6xl mb-4">gpp_maybe</span>
                            <h2 className="text-2xl font-bold text-white mb-2">Service Unreachable</h2>
                            <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
                                The AI optimization engine is currently offline or the connection was interrupted.
                            </p>
                            <div className="bg-error-container/10 border border-error/20 p-4 rounded-xl text-error text-sm font-mono mb-8">
                                {error}
                            </div>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-8 py-4 bg-surface-container-highest rounded-xl font-bold hover:bg-surface-container-highest/80 transition-colors"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Hero Status */}
                            <div className="text-center">
                                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 ${
                                    status.status === 'online' 
                                    ? 'bg-success-container/10 border border-success/20 text-success' 
                                    : 'bg-warning-container/10 border border-warning/20 text-warning'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-success animate-ping' : 'bg-warning animate-pulse'}`}></span>
                                    {status.status === 'online' ? 'System Online / Ready' : 'System Degraded'}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                    Operational Stability: {status.status === 'online' ? '100%' : '60%'}
                                </h1>
                                <p className="text-on-surface-variant">
                                    Dynamic telemetry verifying AI nodes and database connectivity.
                                </p>
                            </div>

                            {/* Node Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/5">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex justify-between">
                                        Database Node
                                        <span className={`w-2 h-2 rounded-full ${status.details.database === 'connected' ? 'bg-success' : 'bg-error'}`}></span>
                                    </div>
                                    <div className="text-2xl font-bold text-white capitalize">
                                        {status.details.database}
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/5">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex justify-between">
                                        Primary AI (Gemini)
                                        <span className={`w-2 h-2 rounded-full ${status.details.gemini === 'ready' ? 'bg-success' : 'bg-error'}`}></span>
                                    </div>
                                    <div className="text-2xl font-bold text-white capitalize">
                                        {status.details.gemini.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/5">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex justify-between">
                                        Fallback AI (Groq)
                                        <span className={`w-2 h-2 rounded-full ${status.details.groq === 'ready' ? 'bg-success' : 'bg-error'}`}></span>
                                    </div>
                                    <div className="text-2xl font-bold text-white capitalize">
                                        {status.details.groq.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/5">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex justify-between">
                                        Environment
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    </div>
                                    <div className="text-2xl font-bold text-white capitalize">
                                        {status.env}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="pt-8 border-t border-outline-variant/10">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Node Telemetry</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-on-surface-variant">Last Pulse</span>
                                        <span className="text-white font-mono">{new Date(status.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-on-surface-variant">Frontend Link</span>
                                        <span className="text-primary truncate ml-4 max-w-[200px] md:max-w-none">{status.frontend}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-on-surface-variant">Session Duration</span>
                                        <span className="text-white">{Math.floor((Date.now() - startTime) / 1000)}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <p className="mt-8 text-center text-on-surface-variant/40 text-[10px] uppercase tracking-[0.3em] font-medium">
                    © 2026 KLEOS.AI. CARVED BY Z35TYYYY
                </p>
            </div>
        </div>
    );
};

export default Status;
