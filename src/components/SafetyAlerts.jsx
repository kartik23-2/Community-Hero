import React from 'react';
import { AlertTriangle, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SafetyAlerts({ issues }) {
  // Filter for critical or high issues to display as safety alerts
  const hazardIssues = issues.filter(
    issue => (issue.severity === 'Critical' || issue.severity === 'High') && issue.status !== 'resolved'
  );

  // Simulated distance calculator helper to show "200m away", "450m away"
  const getSimulatedDistance = (id) => {
    // Generate a distance based on the id hash
    const val = id.charCodeAt(id.length - 1) || 5;
    return `${val * 40}m`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <AlertTriangle color="var(--severity-critical)" size={20} className="animate-pulse-glow" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Nearby Safety Alerts
        </h3>
      </div>

      {hazardIssues.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No active critical safety hazards nearby. Stay safe!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
          {hazardIssues.map((issue) => {
            const distance = getSimulatedDistance(issue.id);
            const isCritical = issue.severity === 'Critical';

            return (
              <div 
                key={issue.id} 
                className="glass-panel" 
                style={{ 
                  padding: '12px 16px', 
                  borderLeft: `4px solid ${isCritical ? 'var(--severity-critical)' : 'var(--severity-high)'}`,
                  background: isCritical ? 'rgba(239, 68, 68, 0.04)' : 'rgba(249, 115, 22, 0.04)',
                  borderColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                  borderLeftColor: isCritical ? 'var(--severity-critical)' : 'var(--severity-high)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: isCritical ? 'var(--severity-critical)' : 'var(--severity-high)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: isCritical ? 'var(--severity-critical)' : 'var(--severity-high)',
                      display: 'inline-block'
                    }} className="animate-pulse-glow" />
                    {issue.severity} Hazard
                  </span>
                  
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <MapPin size={12} />
                    {distance} away
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {issue.title}
                </h4>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {issue.description.substring(0, 80)}...
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {issue.location.address.split(',')[0]}
                  </span>

                  <Link to={`/issue/${issue.id}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}>
                    View Alert
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
