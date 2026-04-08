import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { optimizeResumeUpload } from '../api/resume';

const Dashboard = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please upload a PDF file.');
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError('');
        } else {
            setError('Please upload a PDF file.');
        }
    };

    const handleOptimize = async () => {
        if (!file) {
            setError('Please upload your resume to start.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await optimizeResumeUpload(file, jobDescription, includeCoverLetter);
            navigate(`/results/${result.data.resultId}`);
        } catch (err) {
            let userMessage = err.message || 'An unexpected error occurred.';
            
            // Format raw AI and quota logs into a graceful UI message
            if (userMessage.includes('429') || userMessage.toLowerCase().includes('quota') || userMessage.includes('Too Many Requests')) {
                userMessage = 'Our AI nodes are processing at maximum capacity. Please wait a moment and try again.';
            } else if (userMessage.includes('GoogleGenerativeAI Error')) {
                userMessage = 'The AI engine encountered an unexpected error while reading your resume. Please try again.';
            } else if (userMessage.includes('LLM returned invalid JSON')) {
                userMessage = 'The neural analysis yielded an invalid format. Please retry the execution.';
            }

            setError(userMessage);
            setLoading(false);
        }
    };

    return (
        <div className="p-12">
            {/* Header / Identity */}
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">Premium Tier</p>
                    <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">
                        Welcome back, {user?.name ? user.name.split(' ')[0] : 'Professional'}.
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-bold text-on-surface">{user?.name || user?.email}</p>
                        <p className="text-xs text-on-surface-variant">Profile Active</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-outline-variant/20 bg-surface-container-highest flex items-center justify-center text-primary font-bold overflow-hidden">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* Primary Action: Drag & Drop Zone */}
                <section className="col-span-8 group">
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="glass relative overflow-hidden rounded-xl h-[400px] flex flex-col items-center justify-center border border-outline-variant/10 transition-all duration-500 hover:border-primary/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        
                        <div className="z-10 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-primary text-4xl" data-icon="upload_file">upload_file</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Optimize Your Resume</h2>
                            
                            {error && <p className="text-error text-sm font-semibold mb-2">{error}</p>}
                            
                            {file ? (
                                <div className="mb-6">
                                    <p className="font-bold text-on-surface">{file.name}</p>
                                    <p className="text-xs text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <p className="text-on-surface-variant max-w-sm mb-8">Drag and drop your PDF here to let Kleos AI analyze and enhance your professional impact.</p>
                            )}

                            <input id="fileUpload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                            
                            <div className="flex gap-4">
                                <button 
                                    className="px-8 py-3 bg-surface-container-highest border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-bright transition-colors duration-300"
                                    onClick={() => document.getElementById('fileUpload').click()}
                                >
                                    Browse Files
                                </button>
                                {file && (
                                    <button 
                                        onClick={handleOptimize}
                                        disabled={loading}
                                        className="px-8 py-3 bg-primary text-on-primary-fixed font-bold rounded-xl hover:bg-primary-container transition-colors duration-300 shadow-[0_0_15px_rgba(255,45,85,0.3)]"
                                    >
                                        {loading ? 'Synthesizing...' : 'Execute Analysis'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-8xl text-primary" data-icon="auto_awesome">auto_awesome</span>
                        </div>
                    </div>
                    {file && (
                        <div className="mt-6">
                            <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">target</span> Target Trajectory (Optional)
                            </p>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description or target role details here to calibrate the neural engine specifically for this position..."
                                className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/40 resize-y min-h-[120px] mb-4"
                            />
                            
                            <label className="flex items-center gap-3 cursor-pointer group w-max">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={includeCoverLetter} 
                                        onChange={(e) => setIncludeCoverLetter(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-outline-variant/30 rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                                    />
                                    <span className="material-symbols-outlined absolute text-[14px] text-on-primary-fixed opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                                </div>
                                <span className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">
                                    Synthesize Cover Letter Draft <span className="text-tertiary-fixed-dim/60 ml-1">(Requires extra compute)</span>
                                </span>
                            </label>
                        </div>
                    )}
                </section>

                {/* Stats/AI Insight Mini Bento */}
                <section className="col-span-4 flex flex-col gap-8 h-[400px]">
                    <div className="bg-surface-container rounded-xl p-6 flex flex-col justify-between border-l-4 border-primary h-1/2">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-primary" data-icon="bolt">bolt</span>
                            <span className="text-xs font-bold text-tertiary px-2 py-1 bg-tertiary-container/20 rounded-full">Neural Engine Active</span>
                        </div>
                        <div>
                            <p className="text-on-surface-variant text-sm font-medium mb-1">System Status</p>
                            <p className="text-4xl font-black">Online<span className="text-lg font-normal text-on-surface-variant">/Ready</span></p>
                        </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-6 h-1/2 border border-outline-variant/5">
                        <p className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm" data-icon="psychology">psychology</span>
                            AI ADVISORY
                        </p>
                        <p className="text-on-surface leading-relaxed text-sm italic">
                            "Ready to synthesize your profile. Ensure your PDF has standard selectable text for the highest parsing accuracy."
                        </p>
                    </div>
                </section>
                
            </div>
        </div>
    );
};

export default Dashboard;
