import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', borderTop: 'none', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="gradient-text">
        ResumeAI
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-sm font-semibold hover:text-primary">Dashboard</Link>
            <Link to="/history" className="text-sm font-semibold hover:text-primary">History</Link>
            <div className="flex items-center gap-2" style={{ marginLeft: '1rem' }}>
              <div style={{ background: 'var(--color-surface-bright)', padding: '0.5rem', borderRadius: '50%' }}>
                <User size={16} />
              </div>
              <span className="text-sm">{user.name || user.email}</span>
              <button 
                onClick={handleLogout} 
                className="btn-secondary flex items-center gap-2"
                style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
              >
                <LogOut size={14} /> <span className="text-sm">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/#features" className="text-sm font-semibold">Features</Link>
            <Link to="/#how-it-works" className="text-sm font-semibold">How It Works</Link>
            <Link to="/auth" className="text-sm font-semibold" style={{ marginLeft: '1rem' }}>Login</Link>
            <Link to="/auth" className="btn-primary text-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
