import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const markerIcon = L.divIcon({
    className: 'custom-selector-marker',
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

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

export default function MapSelector({ position, setPosition }) {
  const defaultCenter = [28.59, 77.21];

  return (
    <div className="glass-panel" style={{ height: '280px', overflow: 'hidden', padding: '6px' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
