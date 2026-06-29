import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, PlusCircle, User, Award, Flame, Activity } from 'lucide-react';

export default function Header({ user }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active-nav-link' : '';
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '16px',
      margin: '16px 24px',
      zIndex: 1000,
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-glass)',
      padding: '12px 24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            COMMUNITY HERO
          </span>
        </Link>

        {/* Navigation Routes */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Link to="/" className={`btn btn-secondary ${isActive('/')}`} style={{
            border: 'none',
            background: location.pathname === '/' ? 'var(--primary-glow)' : 'transparent',
            color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: location.pathname === '/' ? '600' : '400',
            padding: '8px 16px'
          }}>
            <Activity size={18} style={{ marginRight: '4px' }} />
            Dashboard
          </Link>
          <Link to="/report" className={`btn btn-secondary ${isActive('/report')}`} style={{
            border: 'none',
            background: location.pathname === '/report' ? 'var(--primary-glow)' : 'transparent',
            color: location.pathname === '/report' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: location.pathname === '/report' ? '600' : '400',
            padding: '8px 16px'
          }}>
            <PlusCircle size={18} style={{ marginRight: '4px' }} />
            Report Issue
          </Link>
          <Link to="/profile" className={`btn btn-secondary ${isActive('/profile')}`} style={{
            border: 'none',
            background: location.pathname === '/profile' ? 'var(--primary-glow)' : 'transparent',
            color: location.pathname === '/profile' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: location.pathname === '/profile' ? '600' : '400',
            padding: '8px 16px'
          }}>
            <User size={18} style={{ marginRight: '4px' }} />
            My Profile
          </Link>
        </nav>

        {/* Gamified Points HUD */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Level Badge */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderRadius: '20px'
          }}>
            <Award size={16} color="var(--secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Level {user.level}
            </span>
          </div>

          {/* Reputation Points */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            borderRadius: '20px'
          }}>
            <Flame size={16} color="var(--primary)" className="animate-pulse" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
              {user.points} XP
            </span>
          </div>

          {/* User Initials Badge */}
          <Link to="/profile" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 800,
            border: '2px solid var(--border-glass)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(6, 182, 212, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            {(() => {
              if (!user.name) return 'CH';
              const parts = user.name.trim().split(/\s+/);
              if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              }
              return user.name.substring(0, 2).toUpperCase();
            })()}
          </Link>
        </div>
      </div>
    </header>
  );
}
