import React from 'react';

export default function ImpactChart({ issues }) {
  // Count by category
  const categories = ["Infrastructure", "Sanitation", "Safety", "Traffic", "Hazard"];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = issues.filter(issue => issue.category.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  // SVG dimensions for Category Bar Chart
  const barChartWidth = 500;
  const barChartHeight = 220;
  const barWidth = 50;
  const gap = 35;
  const startX = 60;
  const startY = 180;

  // Resolve status metrics
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const inProgress = issues.filter(i => i.status === 'in-progress').length;
  const escalated = issues.filter(i => i.status === 'escalated').length;
  const verified = issues.filter(i => i.status === 'verified').length;
  const reported = issues.filter(i => i.status === 'reported').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
      {/* Category Bar Chart */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Issues by Category
        </h3>
        <div style={{ position: 'relative', overflowX: 'auto' }}>
          <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = startY - ratio * (startY - 30);
              const label = Math.round(ratio * maxCount);
              return (
                <g key={index}>
                  <line x1={startX} y1={y} x2={barChartWidth - 20} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                  <text x={startX - 15} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{label}</text>
                </g>
              );
            })}

            {/* Bars */}
            {categories.map((cat, index) => {
              const count = categoryCounts[cat] || 0;
              const barHeight = (count / maxCount) * (startY - 30);
              const x = startX + index * (barWidth + gap) + 15;
              const y = startY - barHeight;

              return (
                <g key={index} style={{ cursor: 'pointer' }}>
                  {/* Tooltip text hidden by default, shown on hover via standard title tag */}
                  <title>{`${cat}: ${count} issues`}</title>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGrad)"
                    rx="4"
                    style={{ transition: 'all 0.3s' }}
                    onMouseOver={(e) => e.target.style.fill = 'var(--primary)'}
                    onMouseOut={(e) => e.target.style.fill = 'url(#barGrad)'}
                  />
                  {/* Count labels */}
                  <text x={x + barWidth / 2} y={y - 8} fill="var(--text-primary)" fontSize="12" fontWeight="600" textAnchor="middle">
                    {count}
                  </text>
                  {/* Category names */}
                  <text x={x + barWidth / 2} y={startY + 20} fill="var(--text-secondary)" fontSize="11" textAnchor="middle">
                    {cat.substring(0, 10)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Resolution Rate and Trend Area Chart */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Resolution Efficiency
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flex: 1 }}>
          {/* Radial Progress Ring */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="var(--status-resolved)" strokeWidth="8" fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - resolutionRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--status-resolved)' }}>
                {resolutionRate}%
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Solved
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reported</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{reported + verified}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-progress)' }}>In Progress</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-progress)' }}>{inProgress + escalated}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-resolved)' }}>Resolved Issues</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-resolved)' }}>{resolved}</div>
            </div>
          </div>
        </div>

        {/* Visual resolution timeline status pill indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status Distribution</div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(reported/total)*100}%`, background: 'var(--status-reported)' }} title={`Reported: ${reported}`} />
            <div style={{ width: `${(verified/total)*100}%`, background: 'var(--status-verified)' }} title={`Verified: ${verified}`} />
            <div style={{ width: `${(escalated/total)*100}%`, background: 'var(--status-escalated)' }} title={`Escalated: ${escalated}`} />
            <div style={{ width: `${(inProgress/total)*100}%`, background: 'var(--status-progress)' }} title={`In Progress: ${inProgress}`} />
            <div style={{ width: `${(resolved/total)*100}%`, background: 'var(--status-resolved)' }} title={`Resolved: ${resolved}`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Reported ({reported})</span>
            <span>Escalated ({escalated})</span>
            <span>Resolved ({resolved})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
