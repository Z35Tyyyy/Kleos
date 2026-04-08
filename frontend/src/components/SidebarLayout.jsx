import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = ({ children }) => {
    const { logoutUser } = useAuth();
    const location = useLocation();

    return (
        <div className="flex bg-surface text-on-surface min-h-screen font-['Plus_Jakarta_Sans'] font-medium">
            {/* SideNavBar Shell */}
            <aside className="w-64 fixed left-0 top-0 bg-[#1C1B1B] flex flex-col py-8 px-4 h-full z-50">
                <div className="text-lg font-black text-[#FFB3B5] mb-8 px-4">Kleos AI</div>
                
                <button className="bg-gradient-to-br from-[#FFB3B5] to-[#FF5167] text-[#40000C] font-bold py-3 px-6 rounded-xl mb-10 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Optimize New
                </button>

                <nav className="flex-1 space-y-2">
                    <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'bg-[#FF5167]/10 text-[#FFB3B5] border-r-2 border-[#FFB3B5]' : 'text-[#E5E2E1]/50 hover:bg-[#353534] hover:translate-x-2'} rounded-lg px-4 py-3 flex items-center gap-3 font-medium transition-all duration-200`}>
                        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                        Dashboard
                    </Link>
                    <Link to="/history" className={`${location.pathname === '/history' ? 'bg-[#FF5167]/10 text-[#FFB3B5] border-r-2 border-[#FFB3B5]' : 'text-[#E5E2E1]/50 hover:bg-[#353534] hover:translate-x-2'} rounded-lg px-4 py-3 flex items-center gap-3 font-medium transition-all duration-200`}>
                        <span className="material-symbols-outlined" data-icon="description">history</span>
                        Archived History
                    </Link>
                </nav>
                
                <div className="mt-auto space-y-2">
                    <button className="w-full text-left text-[#E5E2E1]/50 px-4 py-3 flex items-center gap-3 font-medium hover:bg-[#353534] transition-colors duration-200" onClick={logoutUser}>
                        <span className="material-symbols-outlined" data-icon="logout">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="ml-64 flex-1 flex flex-col bg-surface-container-lowest min-h-screen">
                {children}

                {/* Global Footer */}
                <footer className="mt-auto py-12 flex flex-col md:flex-row justify-between items-center px-12 border-t border-[#5D3F40]/15 bg-[#0E0E0E]">
                    <p className="text-xs uppercase tracking-widest text-[#353534]">© 2026 Kleos AI. Carved from Smoke.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a className="text-xs uppercase tracking-widest text-[#353534] hover:text-[#E5E2E1] transition-colors duration-500" href="#">Privacy Policy</a>
                        <a className="text-xs uppercase tracking-widest text-[#353534] hover:text-[#E5E2E1] transition-colors duration-500" href="#">Terms of Service</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default SidebarLayout;
