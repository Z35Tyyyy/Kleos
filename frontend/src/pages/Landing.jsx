import React, { useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from '../components/Background3D';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="bg-[#0A0A0A] text-[#E5E2E1] font-['Plus_Jakarta_Sans'] overflow-x-hidden min-h-screen relative">
            <Suspense fallback={null}>
                <Background3D />
            </Suspense>

            {/* TopNavBar */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 w-full z-50 glass-nav"
            >
                <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
                    <div className="text-xl font-extrabold tracking-tighter text-white font-headline flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Kleos
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all mr-6 hidden sm:block" to="/status">
                            System Status
                        </Link>
                        <Link to="/auth" className="magnetic-button bg-primary text-white px-7 py-2.5 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.nav>

            <main className="relative">
                {/* Hero Section */}
                <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-5xl w-full text-center space-y-8" 
                        id="hero-content"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center px-5 py-2 rounded-full glass-card text-primary text-[11px] font-bold tracking-[0.3em] uppercase">
                            Neural-Driven Career Architecture
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-7xl md:text-[110px] font-black tracking-[-0.05em] leading-[0.85] text-white">
                            Master your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-[#FF6B8B] text-glow">professional destiny.</span>
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed tracking-tight">
                            Synthesize your experience with AI precision. <br className="hidden md:block" />
                            Elevate your narrative through high-fidelity ATS optimization.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                            <Link to="/auth" className="magnetic-button w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-bold text-lg transition-all text-center shadow-[0_20px_50px_rgba(255,45,85,0.3)] hover:scale-105 active:scale-95 duration-300">
                                Start Optimizing
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Value Propositions */}
                <section className="py-40 px-8 max-w-7xl mx-auto">
                    <div className="reveal mb-24 space-y-6">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white">Engineered for <br />Elite Performance</h2>
                        <div className="h-1 w-24 bg-primary"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-100"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Neural Optimization</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Deep-learning algorithms that calibrate your experience for modern recruitment engines.</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-200"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">target</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">ATS Calibration</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Precision alignment with Job Descriptions to ensure your profile breaches every digital filter.</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="reveal glass-card p-12 rounded-2xl group hover:border-primary/40 transition-all duration-500 delay-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Atomic Analysis</h3>
                            <p className="text-on-surface-variant leading-relaxed font-light">Real-time feedback loops providing deep insights into your professional impact.</p>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-40 px-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="reveal max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-surface-container to-surface border border-white/5 p-24 text-center relative overflow-hidden"
                    >
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[150px] animate-pulse"></div>
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[150px] animate-pulse"></div>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-10 leading-none">Your future, <br /><span className="text-primary">sculpted by intelligence.</span></h2>
                        <Link to="/auth" className="magnetic-button bg-primary text-white px-16 py-6 rounded-2xl font-bold text-xl transition-all shadow-[0_20px_50px_rgba(255,45,85,0.3)] inline-block hover:scale-105 active:scale-95 duration-300">
                            Build Your Future
                        </Link>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 bg-surface border-t border-white/5">
                <div className="max-w-7xl mx-auto px-12 text-center">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant font-medium">
                        © 2026 KLEOS.AI. CARVED BY Z35TYYYY
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
;
