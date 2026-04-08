import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResultsHistory } from '../api/resume';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getResultsHistory()
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getScoreColor = (score) => {
        if (!score && score !== 0) return 'text-on-surface-variant';
        if (score >= 80) return 'text-tertiary-fixed-dim';
        if (score >= 60) return 'text-on-surface';
        return 'text-error';
    };

    const getVerdictStyle = (verdict) => {
        const styles = {
            strong: 'text-tertiary-fixed-dim',
            good:   'text-tertiary-fixed-dim',
            fair:   'text-primary',
            weak:   'text-error',
        };
        return styles[verdict] || 'text-on-surface-variant';
    };

    return (
        <div className="px-12 pb-24 pt-8">
            {/* Top Navigation Area (Implicit Branding) */}
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface">Resumes</h1>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-medium mt-1">Optimization History</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input 
                            className="bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-full pl-10 pr-6 py-2 text-sm text-on-surface w-64 transition-all duration-300" 
                            placeholder="Search roles..." 
                            type="text" 
                        />
                    </div>
                </div>
            </header>

            {/* Filters & Stats Bento Layout */}
            <div className="grid grid-cols-12 gap-6 mb-12">
                <div className="col-span-8 bg-surface-container rounded-2xl p-8 flex items-end justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <span className="label-md text-primary font-bold uppercase tracking-widest block mb-4">Current Trajectory</span>
                        <h2 className="text-4xl font-light leading-tight">
                            Your resumes are performing <br />
                            <span className="font-bold text-on-surface italic">24% better</span> this month.
                        </h2>
                    </div>
                    <div className="h-32 w-48 bg-gradient-to-t from-primary/10 to-transparent absolute bottom-0 right-0 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                </div>
                
                <div className="col-span-4 bg-surface-container-high rounded-2xl p-8 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-on-surface-variant text-sm">Total Optimizations</span>
                        <span className="text-primary font-bold">{history.length}</span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                        <div className="h-full monolith-gradient w-[65%]"></div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-4">Keep optimizing</p>
                </div>
            </div>

            {/* List View: Minimalist Cards */}
            {loading ? (
                <div className="text-center py-20 text-on-surface-variant font-bold tracking-widest uppercase text-sm animate-pulse">Retrieving Data Archives...</div>
            ) : history.length === 0 ? (
                <div className="glass-panel text-center py-20 rounded-2xl border border-outline-variant/5">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">history</span>
                    <h3 className="text-xl font-bold text-on-surface">No Activity Found</h3>
                    <p className="text-on-surface-variant mt-2">Visit the dashboard to run your first optimization.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map(item => (
                        <div 
                            key={item.resultId}
                            onClick={() => navigate(`/results/${item.resultId}`)}
                            className="glass-panel group flex items-center justify-between p-6 rounded-2xl border border-outline-variant/5 hover:bg-surface-container-highest/40 transition-all duration-500 cursor-pointer"
                        >
                            <div className="flex items-center gap-8 flex-1">
                                <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-3xl" data-icon="terminal" data-weight="fill">description</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                                        {item.jobDescription?.job_title || item.jobTitle || 'General Optimization'}
                                    </h3>
                                    <p className="text-on-surface-variant text-sm">
                                        Optimized {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-16">
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">ATS Match</span>
                                    <span className={`text-2xl font-black ${getScoreColor(item.atsScore?.overall_score)}`}>
                                        {item.atsScore?.overall_score != null ? `${item.atsScore.overall_score}%` : 'N/A'}
                                    </span>
                                    {item.atsScore?.verdict && (
                                        <span className={`block text-[10px] uppercase tracking-[0.15em] font-bold mt-1 ${getVerdictStyle(item.atsScore.verdict)}`}>
                                            {item.atsScore.verdict}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]" data-icon="more_vert">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
