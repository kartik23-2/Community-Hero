import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Shield, Eye } from 'lucide-react';

// Custom colored leaflet marker creator
const getMarkerIcon = (severity) => {
  let color = '#06b6d4'; // Default cyan
  if (severity === 'Critical') color = 'var(--severity-critical)';
  else if (severity === 'High') color = 'var(--severity-high)';
  else if (severity === 'Medium') color = 'var(--severity-medium)';
  else if (severity === 'Low') color = 'var(--severity-low)';

  return L.divIcon({
    className: 'custom-marker',
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
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 0 15px ${color};
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
    popupAnchor: [0, -32]
  });
};

export default function MapDashboard({ issues }) {
  // Center map around New Delhi coordinates of mock data
  const defaultCenter = [28.59, 77.21];
  const defaultZoom = 12;

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
    <div className="glass-panel" style={{ height: '450px', overflow: 'hidden', padding: '10px', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 500,
        pointerEvents: 'none'
      }}>
        <div className="glass-panel" style={{
          padding: '8px 14px',
          background: 'rgba(7, 10, 19, 0.85)',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto'
        }}>
          <Shield size={14} color="var(--primary)" />
          Live Community Feed Map
        </div>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)' }}
        scrollWheelZoom={true}
      >
        {/* CartoDB Dark Matter tiles matching dark style */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {issues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]}
            icon={getMarkerIcon(issue.severity)}
          >
            <Popup>
              <div style={{ minWidth: '180px', fontFamily: 'var(--font-sans)' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className="badge" style={{
                    background: `rgba(255, 255, 255, 0.05)`,
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    padding: '2px 6px',
                    fontSize: '0.65rem'
                  }}>
                    {issue.category}
                  </span>
                  <span className="badge" style={{
                    background: getStatusColor(issue.status) + '1c',
                    color: getStatusColor(issue.status),
                    border: `1px solid ${getStatusColor(issue.status)}4d`,
                    padding: '2px 6px',
                    fontSize: '0.65rem'
                  }}>
                    {issue.status}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  {issue.title}
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                  {issue.location.address.split(',')[0]}
                </p>
                <Link to={`/issue/${issue.id}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--border-glass-hover)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--primary-glow)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                >
                  <Eye size={12} />
                  Inspect Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
