import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, ShieldAlert, Droplets, MessageSquareCode, Wrench, Lock, Eye, Flame, History, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API } from '../config';

const badgeIcons = {
  ShieldAlert: ShieldAlert,
  Award: Award,
  Droplets: Droplets,
  MessageSquareCode: MessageSquareCode,
  Wrench: Wrench
};

export default function Profile() {
  const { user, setUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync user details and fetch reported issues
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch issues
        const resIssues = await fetch(`${API}/api/issues`);
        let currentIssues = [];
        if (resIssues.ok) {
          currentIssues = await resIssues.json();
          setIssues(currentIssues);
        }

        // Fetch latest user points
        const resUser = await fetch(`${API}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching profile assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border-glass)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
        }} className="animate-spin" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Syncing Citizen Profile...</span>
      </div>
    );
  }

  // Calculate Level progress
  const xpNeededForNextLevel = 500;
  const currentLevelXp = user.points % xpNeededForNextLevel;
  const progressPercent = Math.min((currentLevelXp / xpNeededForNextLevel) * 100, 100);

  // Filter issues reported by this specific user
  const userIssues = issues.filter(i => i.reportedBy === user.name);

  // Badges metadata mapping
  const allBadgesList = [
    {
      id: "b1",
      name: "First Responder",
      description: "Reported your first community issue",
      icon: "ShieldAlert",
      color: "#06b6d4"
    },
    {
      id: "b2",
      name: "Community Pillar",
      description: "Earned 15+ verifications from other users",
      icon: "Award",
      color: "#8b5cf6"
    },
    {
      id: "b3",
      name: "Sanitation Sentinel",
      description: "Reported and helped resolve a sanitation issue",
      icon: "Droplets",
      color: "#3b82f6"
    },
    {
      id: "b4",
      name: "Civic Mentor",
      description: "Contributed 10+ constructive comments on issue details",
      icon: "MessageSquareCode",
      color: "#10b981"
    },
    {
      id: "b5",
      name: "Infrastructure Inspector",
      description: "Reported 5+ verified infrastructure issues",
      icon: "Wrench",
      color: "#f59e0b"
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'var(--status-resolved)';
      case 'in-progress': return 'var(--status-progress)';
      case 'escalated': return 'var(--status-escalated)';
      case 'verified': return 'var(--status-verified)';
      default: return 'var(--status-reported)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 40px 24px' }}>
      
      {/* Page Title & Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Citizen Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Track your civic reputation, earned achievements, and contribution timeline.
          </p>
        </div>

        <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Profile Avatar, Level HUD, Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              margin: '0 auto 16px auto',
              border: '3px solid var(--primary)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800
            }}>
              {(() => {
                if (!user.name) return 'CH';
                const parts = user.name.trim().split(/\s+/);
                if (parts.length >= 2) {
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                }
                return user.name.substring(0, 2).toUpperCase();
              })()}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {user.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {user.email}
            </p>

            {/* Level & XP HUD */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={14} color="var(--primary)" />
                  Reputation Level {user.level}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {user.points} XP
                </span>
              </div>
              
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--primary)', transition: 'width 0.4s' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>{currentLevelXp} XP</span>
                <span>{xpNeededForNextLevel - currentLevelXp} XP to Level {user.level + 1}</span>
              </div>
            </div>

            {/* Overall Stats Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{user.reportedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reports</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{user.verifiedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Verifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Achievements Cabinet & Contribution History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Badge cabinet */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={18} color="var(--primary)" />
              Badge Cabinet
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {allBadgesList.map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Award;
                const isEarned = user.badges.some(b => b.id === badge.id);

                return (
                  <div 
                    key={badge.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      opacity: isEarned ? 1 : 0.45,
                      border: '1px solid',
                      borderColor: isEarned ? 'var(--border-glass)' : 'rgba(255,255,255,0.03)',
                      background: isEarned ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Badge Icon circle */}
                    <div style={{
                      padding: '8px',
                      borderRadius: '50%',
                      background: isEarned ? `${badge.color}15` : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: isEarned ? `${badge.color}4d` : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isEarned ? (
                        <IconComponent size={20} color={badge.color} />
                      ) : (
                        <Lock size={20} color="var(--text-muted)" />
                      )}
                    </div>

                    <div>
                      <h4 style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: isEarned ? 'var(--text-primary)' : 'var(--text-muted)' 
                      }}>
                        {badge.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {badge.description}
                      </p>
                    </div>

                    {isEarned && (
                      <div style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '-16px',
                        width: '32px',
                        height: '32px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        transform: 'rotate(45deg)'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log / History & Personal Reports */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* My Reported Issues Feed */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={16} color="var(--primary)" />
                My Civic Reports
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {userIssues.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    You haven't reported any issues yet.
                  </div>
                ) : (
                  userIssues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '10px 12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {issue.title}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: getStatusColor(issue.status) }}>
                          Status: {issue.status}
                        </span>
                      </div>
                      
                      <Link to={`/issue/${issue.id}`} className="btn btn-secondary" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        <Eye size={12} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* XP Points History log */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} color="var(--secondary)" />
                XP Activity Feed
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {user.history.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No activity registered yet.
                  </div>
                ) : (
                  user.history.map((log) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: '8px 10px', 
                        background: 'rgba(255,255,255,0.01)',
                        borderBottom: '1px solid var(--border-glass)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <div style={{ maxWidth: '75%' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.text}</p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {new Date(log.date).toLocaleDateString()} &bull; {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                        +{log.points} XP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
