import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-[#0A0A0A] text-[#E5E2E1] font-['Plus_Jakarta_Sans'] overflow-x-hidden min-h-screen">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 glass-nav">
                <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
                    <div className="text-xl font-extrabold tracking-tighter text-white font-headline flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Kleos
                    </div>
                    <div className="hidden md:flex items-center space-x-10 text-[13px] font-medium tracking-widest uppercase">
                        <a className="text-primary hover:opacity-100 transition-opacity" href="#">Features</a>
                        <a className="text-on-surface/50 hover:text-primary transition-all" href="#">Showcase</a>
                        <a className="text-on-surface/50 hover:text-primary transition-all" href="#">Pricing</a>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="hidden sm:block text-on-surface/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                        </button>
                        <Link to="/auth" className="magnetic-button bg-primary text-white px-7 py-2.5 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative">
                {/* Hero Section */}
                <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                    <div className="hero-glow absolute inset-0 -z-10 animate-pulse-slow"></div>
                    <div className="reveal max-w-5xl w-full text-center space-y-8" id="hero-content">
                        <div className="inline-flex items-center px-5 py-2 rounded-full glass-card text-primary text-[11px] font-bold tracking-[0.3em] uppercase">
                            Revolutionizing Career Architecture
                        </div>
                        <h1 className="text-7xl md:text-[110px] font-black tracking-[-0.05em] leading-[0.85] text-white">
                            Master your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-[#FF6B8B] text-glow">professional destiny.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed tracking-tight">
                            Neural-driven ATS synthesis with Zen-like precision. <br className="hidden md:block" />
                            Elevate your professional narrative through high-fidelity AI carving.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                            <Link to="/auth" className="magnetic-button w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-bold text-lg transition-all text-center">
                                Start Optimizing
                            </Link>
                            <a href="#showcase" className="w-full sm:w-auto px-12 py-5 glass-card text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all text-center">
                                View Showcase
                            </a>
                        </div>
                    </div>
                </section>

                {/* Value Propositions */}
                <section className="py-40 px-8 max-w-7xl mx-auto">
                    <div className="reveal mb-24 space-y-6">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white">Engineered for <br />Elite Performance</h2>
                        <div className="h-1 w-24 bg-primary"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pillar 1 */}
                        <div className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-100">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Neural ATS Optimization</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Deep-learning algorithms that synthesize your experience into a narrative perfectly calibrated for modern recruitment engines.</p>
                        </div>
                        {/* Pillar 2 */}
                        <div className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-200">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">map</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Career Mapping</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Advanced trajectory modeling that visualizes your professional evolution and identifies the optimal path to executive roles.</p>
                        </div>
                        {/* Pillar 3 */}
                        <div className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-300">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Precision Analysis</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Real-time feedback loops and sentiment analysis providing atomic-level insights into how your profile is perceived by top-tier firms.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-40 px-8">
                    <div className="reveal max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-surface-container to-surface border border-white/5 p-24 text-center relative overflow-hidden">
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[150px] animate-pulse"></div>
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[150px] animate-pulse"></div>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-10 leading-none">Your future, <br /><span className="text-primary">sculpted by intelligence.</span></h2>
                        <p className="text-xl text-on-surface-variant mb-14 max-w-2xl mx-auto font-light leading-relaxed">Join the inner circle of 50,000+ professionals who have already transcended the standard career curve.</p>
                        <Link to="/auth" className="magnetic-button bg-primary text-white px-16 py-6 rounded-2xl font-bold text-xl transition-all shadow-[0_20px_50px_rgba(255,45,85,0.3)] inline-block">
                            Build Your Future
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-16 bg-surface border-t border-white/5">
                <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="text-xl font-extrabold tracking-tighter text-white font-headline flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Kleos
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant">© 2026 Kleos AI. Carved from Smoke.</p>
                    </div>
                    <div className="flex space-x-12">
                        <Link className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all" to="/status">System Status</Link>
                        <a className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all" href="#">Privacy</a>
                        <a className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all" href="#">Terms</a>
                        <a className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all" href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
