import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, ThumbsUp, Landmark, Calendar, MessageSquare, AlertTriangle, Send, ShieldCheck, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser, token } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  // Fetch issue details on mount
  const fetchIssueDetails = async () => {
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        const found = data.find(i => i.id === id);
        setIssue(found);
      }
    } catch (err) {
      console.error('Error fetching issue detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border-glass)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
        }} className="animate-spin" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading Issue Details...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Issue Not Found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Leaflet Pin Icon
  const markerIcon = L.divIcon({
    className: 'custom-detail-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 30px;
          height: 30px;
          background: var(--primary);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 0 15px var(--primary);
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          width: 10px;
          height: 10px;
          background: #070a13;
          border-radius: 50%;
          z-index: 3;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'var(--status-resolved)';
      case 'in-progress': return 'var(--status-progress)';
      case 'escalated': return 'var(--status-escalated)';
      case 'verified': return 'var(--status-verified)';
      default: return 'var(--status-reported)';
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--severity-critical)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'High': return { bg: 'rgba(249, 115, 22, 0.1)', text: 'var(--severity-high)', border: 'rgba(249, 115, 22, 0.3)' };
      case 'Medium': return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--severity-medium)', border: 'rgba(245, 158, 11, 0.3)' };
      default: return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--severity-low)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const timelineSteps = [
    { label: 'Reported', key: 'reported' },
    { label: 'Verified', key: 'verified' },
    { label: 'Escalated', key: 'escalated' },
    { label: 'In Progress', key: 'in-progress' },
    { label: 'Resolved', key: 'resolved' },
  ];

  const getStepIndex = (status) => {
    return timelineSteps.findIndex(step => step.key === status);
  };

  const currentStepIdx = getStepIndex(issue.status);

  // Authenticated Helper to refetch current User Details
  const refetchUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to sync user score:', err);
    }
  };

  // Voting / Upvote action
  const handleVerify = async () => {
    if (!user) {
      alert("Please log in to verify community issues.");
      navigate('/login');
      return;
    }

    if (issue.verifiedBy.includes(user.email)) {
      alert("You have already verified this issue!");
      return;
    }

    try {
      const res = await fetch(`/api/issues/${id}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        refetchUser();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to register verification.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Government escalation simulation
  const handleEscalate = async () => {
    if (!user) return;
    setIsEscalating(true);

    try {
      const res = await fetch(`/api/issues/${id}/escalate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        refetchUser();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to escalate report.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEscalating(false);
    }
  };

  // Start Fix simulation
  const handleStartFix = async () => {
    try {
      const res = await fetch(`/api/issues/${id}/start-fix`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIssue(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve issue simulation
  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/issues/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        refetchUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      alert("Please log in to post updates.");
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/issues/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (res.ok) {
        const data = await res.json();
        setIssue(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment]
        }));
        setCommentText('');
        refetchUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const severityStyle = getSeverityStyle(issue.severity);

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 40px 24px' }}>
      
      {/* Back navigation */}
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '24px', padding: '6px 12px', border: 'none' }}>
        <ArrowLeft size={16} />
        Dashboard Feed
      </button>

      {/* Grid Layout: Details vs Interactive Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Details, Image, and Leaflet Map Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Inspection Card */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {/* Image Header */}
            {issue.mediaUrl && (
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <img src={issue.mediaUrl} alt={issue.title} style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(7, 10, 19, 0.85)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} />
                  Reported {new Date(issue.reportedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
                <span className="badge" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)'
                }}>
                  {issue.category}
                </span>

                <span className="badge" style={{ 
                  background: severityStyle.bg, 
                  color: severityStyle.text,
                  border: `1px solid ${severityStyle.border}`
                }}>
                  {issue.severity} Severity
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
                {issue.title}
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {issue.description}
              </p>

              <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', marginBottom: '16px' }} />

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Reported By:</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{issue.reportedBy}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Verifications:</span>{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{issue.verifications} Citizens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaflet Map Card showing precise coordinates */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} color="var(--primary)" />
              Problem Location
            </h3>
            
            <div style={{ height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px' }}>
              <MapContainer 
                center={[issue.location.lat, issue.location.lng]} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[issue.location.lat, issue.location.lng]} icon={markerIcon} />
              </MapContainer>
            </div>
            
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              📍 {issue.location.address}
            </span>
          </div>

        </div>

        {/* Right Column: Status Stepper, Actions & Comments Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timeline and Stepper Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
              Tracking Timeline
            </h3>

            {/* Stepper display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '32px' }}>
              {/* Stepper Bar Background */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '20px',
                right: '20px',
                height: '3px',
                background: 'rgba(255,255,255,0.05)',
                zIndex: 1
              }} />
              
              {/* Active Stepper Bar */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '20px',
                width: currentStepIdx > 0 ? `${(currentStepIdx / (timelineSteps.length - 1)) * 100 - 10}%` : '0%',
                height: '3px',
                background: getStatusColor(issue.status),
                zIndex: 1,
                transition: 'width 0.5s ease'
              }} />

              {timelineSteps.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                return (
                  <div key={step.key} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    position: 'relative',
                    width: '60px'
                  }}>
                    {/* Circle Indicator */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCurrent 
                        ? getStatusColor(issue.status) 
                        : (isActive ? 'rgba(6, 182, 212, 0.2)' : '#1e293b'),
                      border: '2px solid',
                      borderColor: isActive ? getStatusColor(step.key) : 'var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: isCurrent ? `0 0 12px ${getStatusColor(issue.status)}` : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {idx + 1}
                    </div>

                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: isCurrent ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 700 : 500,
                      marginTop: '8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Verification and Escalation Actions */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '16px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              
              {/* Verification Progress Panel */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Community Verification Progress
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {issue.verifications} / 3 Votes
                  </span>
                </div>
                
                {/* Progress bar */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min((issue.verifications / 3) * 100, 100)}%`, 
                    background: 'var(--status-verified)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '70%' }}>
                    Needs 3 verifications from community residents to unlock official government reporting.
                  </p>

                  <button 
                    onClick={handleVerify}
                    disabled={user && issue.verifiedBy.includes(user.email) || issue.status === 'resolved'}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      opacity: (user && issue.verifiedBy.includes(user.email) || issue.status === 'resolved') ? 0.5 : 1,
                      background: user && issue.verifiedBy.includes(user.email) ? 'var(--border-glass)' : 'linear-gradient(135deg, var(--status-verified), var(--primary))',
                      boxShadow: 'none'
                    }}
                  >
                    <ThumbsUp size={14} />
                    {user && issue.verifiedBy.includes(user.email) ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)' }} />

              {/* Government Escalation Action Panel */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Government Action Center
                    </h4>
                    
                    {issue.status === 'reported' ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--severity-high)' }}>
                        ⚠️ Awaiting community verifications before escalation.
                      </p>
                    ) : issue.escalationInfo ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--status-escalated)' }}>
                        🏛️ <strong>Escalated to:</strong> {issue.escalationInfo.agency}
                        <br />
                        🎫 <strong>Ticket ID:</strong> #{issue.escalationInfo.ticketId}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--status-resolved)' }}>
                        ✅ Verified! Ready to forward to official municipal bodies.
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Escalate button */}
                    {issue.status === 'verified' && (
                      <button 
                        onClick={handleEscalate}
                        disabled={isEscalating || !user}
                        className="btn btn-secondary animate-pulse-glow"
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.8rem',
                          background: 'rgba(168, 85, 247, 0.1)',
                          borderColor: 'rgba(168, 85, 247, 0.4)',
                          color: '#c084fc'
                        }}
                      >
                        {isEscalating ? (
                          <>
                            <Landmark size={14} className="animate-spin" />
                            Escalating...
                          </>
                        ) : (
                          <>
                            <Landmark size={14} />
                            Escalate Gov
                          </>
                        )}
                      </button>
                    )}

                    {/* Authority Support: Simulating In Progress and Resolving */}
                    {issue.status === 'escalated' && user && (
                      <button 
                        onClick={handleStartFix}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      >
                        Start Fix
                      </button>
                    )}

                    {issue.status === 'in-progress' && user && (
                      <button 
                        onClick={handleResolve}
                        className="btn btn-success"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Comments and Verification Board */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={18} color="var(--primary)" />
              Citizen Discussion Feed
            </h3>

            {/* List of comments */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              maxHeight: '260px', 
              overflowY: 'auto', 
              marginBottom: '20px',
              paddingRight: '4px',
              flex: 1
            }}>
              {issue.comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No comments yet. Start the coordination below!
                </div>
              ) : (
                issue.comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '12px',
                      background: comment.isSystem ? 'rgba(6, 182, 212, 0.03)' : 'rgba(255,255,255,0.01)',
                      borderColor: comment.isSystem ? 'rgba(6, 182, 212, 0.2)' : 'var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: comment.isSystem ? 'var(--primary)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {comment.isSystem && <ShieldCheck size={12} />}
                        {comment.user}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {issue.status !== 'resolved' && (
              <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder={user ? "Post comment or structural update (+5 XP)..." : "Log in to post comments"} 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="form-control"
                  style={{ height: '42px', paddingRight: '48px' }}
                  disabled={!user}
                />
                {user && (
                  <button type="submit" className="btn btn-primary" style={{
                    position: 'absolute',
                    right: '4px',
                    top: '4px',
                    height: '34px',
                    width: '38px',
                    padding: 0,
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <Send size={14} />
                  </button>
                )}
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
