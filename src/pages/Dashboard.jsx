import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Users, Activity, Search, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapDashboard from '../components/MapDashboard';
import ImpactChart from '../components/ImpactChart';
import SafetyAlerts from '../components/SafetyAlerts';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [predictiveInsights, setPredictiveInsights] = useState([]);

  // Fetch all issues & AI predictions from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resIssues, resPredictions] = await Promise.all([
          fetch('/api/issues'),
          fetch('/api/predictions')
        ]);
        
        if (resIssues.ok) {
          const issuesData = await resIssues.json();
          setIssues(issuesData);
        }
        if (resPredictions.ok) {
          const predictionsData = await resPredictions.json();
          setPredictiveInsights(predictionsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard assets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Statistics
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;

  // Real-world dynamic calculations
  const getActiveCitizensCount = () => {
    const citizens = new Set();
    issues.forEach(issue => {
      if (issue.reportedBy) citizens.add(issue.reportedBy);
      if (issue.verifiedBy && Array.isArray(issue.verifiedBy)) {
        issue.verifiedBy.forEach(userEmail => citizens.add(userEmail));
      }
      if (issue.comments && Array.isArray(issue.comments)) {
        issue.comments.forEach(comment => {
          if (!comment.isSystem && comment.user) citizens.add(comment.user);
        });
      }
    });
    return citizens.size || 1; // Default to at least 1 (the current user/reporter)
  };

  const getAvgResolutionTime = () => {
    const resolvedList = issues.filter(i => i.status === 'resolved' && i.reportedAt);
    if (resolvedList.length === 0) return 'Awaiting Fix';

    let totalMs = 0;
    resolvedList.forEach(issue => {
      // Find the resolution system comment or fallback to current date
      const resolutionComment = issue.comments?.find(c => c.isSystem && c.text.includes('RESOLVED'));
      const end = resolutionComment ? new Date(resolutionComment.timestamp) : new Date();
      const start = new Date(issue.reportedAt);
      totalMs += Math.max(end - start, 0);
    });

    const avgHours = totalMs / (1000 * 60 * 60 * resolvedList.length);
    if (avgHours < 1) {
      return `${Math.round(avgHours * 60)} mins`;
    }
    if (avgHours < 24) {
      return `${avgHours.toFixed(1)} hrs`;
    }
    return `${(avgHours / 24).toFixed(1)} days`;
  };

  const activeCitizens = getActiveCitizensCount();
  const avgResolutionTime = getAvgResolutionTime();

  // Filters issues based on search term and category
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || issue.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Infrastructure', 'Sanitation', 'Safety', 'Traffic', 'Hazard'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'resolved': return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--status-resolved)' };
      case 'in-progress': return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: 'var(--status-progress)' };
      case 'escalated': return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)', text: 'var(--status-escalated)' };
      case 'verified': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: 'var(--status-verified)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)', text: 'var(--status-reported)' };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'var(--severity-critical)';
      case 'High': return 'var(--severity-high)';
      case 'Medium': return 'var(--severity-medium)';
      default: return 'var(--severity-low)';
    }
  };

  // predictiveInsights is now handled dynamically from state

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
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading Civic Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 40px 24px' }}>
      
      {/* Page Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Hyperlocal Problem Solver
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Real-time civic intelligence, community tracking, and AI-powered infrastructure insights.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
            <Activity size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Reports</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalIssues}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
            <CheckCircle size={24} color="var(--status-resolved)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Issues Resolved</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{resolvedIssues}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
            <Users size={24} color="var(--secondary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Citizens</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeCitizens}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
            <Activity size={24} color="var(--status-progress)" className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Fix Speed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{avgResolutionTime}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Safety widgets */}
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        
        {/* Left Column (Map & Impact Chart) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MapDashboard issues={issues} />
          <ImpactChart issues={issues} />
        </div>

        {/* Right Column (Safety Alerts & Predictive Insights) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Nearby Safety Alerts */}
          <SafetyAlerts issues={issues} />

          {/* AI Predictive Infrastructure Insights */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield color="var(--secondary)" size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                AI Predictive Insights
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {predictiveInsights.map((insight) => (
                <div key={insight.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {insight.hazard}
                    </span>
                    <span className="badge" style={{ 
                      background: `${getSeverityColor(insight.severity)}1a`, 
                      color: getSeverityColor(insight.severity),
                      border: `1px solid ${getSeverityColor(insight.severity)}4d`
                    }}>
                      {insight.probability}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '6px' }}>
                    📍 {insight.location} &bull; {insight.timeframe}
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {insight.reason}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={12} />
              Predictions are generated based on municipal sensor data feeds.
            </div>
          </div>

        </div>

      </div>

      {/* Community Feed / Issue List Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Civic Issues Board
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Filter, track, and verify reported problems in your neighborhood.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              placeholder="Search issues, roads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '12px', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.03)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'transparent' : 'var(--border-glass)',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Issues List Grid */}
        {filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No community issues matching your filters were found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredIssues.map((issue) => {
              const statusStyle = getStatusStyle(issue.status);
              
              return (
                <div key={issue.id} className="glass-panel-interactive animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Category & Status Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge" style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)'
                    }}>
                      {issue.category}
                    </span>
                    <span className="badge" style={{ 
                      background: statusStyle.bg, 
                      color: statusStyle.text,
                      border: `1px solid ${statusStyle.border}`
                    }}>
                      {issue.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineClamp: 1 }}>
                    {issue.title}
                  </h3>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {issue.description}
                  </p>

                  <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', marginBottom: '12px' }} />

                  {/* Footer details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📍 {issue.location.address.split(',')[0]}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        By {issue.reportedBy} &bull; {new Date(issue.reportedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link to={`/issue/${issue.id}`} className="btn btn-secondary" style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      Inspect
                      <ArrowRight size={12} />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
