import React, { useState } from 'react';

const GeoMap = () => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const regions = [
    { id: 'ind', name: 'India & Neighborhood', tag: 'CDS/NDA Focus', importance: 'High', news: 'Border infrastructure projects in Ladakh.', x: '68%', y: '45%' },
    { id: 'me', name: 'Middle East', tag: 'Geopolitics', importance: 'Medium', news: 'Red Sea security and maritime trade.', x: '55%', y: '42%' },
    { id: 'eur', name: 'Europe', tag: 'International Relations', importance: 'High', news: 'NATO expansion and Ukraine conflict updates.', x: '45%', y: '30%' },
    { id: 'sea', name: 'South East Asia', tag: 'Strategic', importance: 'Medium', news: 'South China Sea maritime disputes.', x: '78%', y: '50%' },
  ];

  return (
    <div className="card" style={{ borderRadius: 24, padding: 24, overflow: 'hidden', position: 'relative', background: 'var(--bg2)', border: '1px solid rgba(99,102,241,0.1)' }}>
      <div className="card-title" style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        🌍 Strategic Map <span style={{ fontSize: 10, background: 'var(--indigo)', padding: '2px 8px', borderRadius: 4, color: 'white' }}>LIVE</span>
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: 220, background: 'rgba(15,23,42,0.4)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Simplified World Map SVG Background */}
        <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', opacity: 0.3, fill: 'var(--text5)' }}>
          <path d="M150,100 Q200,80 250,120 T350,100 T450,150 T550,120 T650,180 T750,150 L750,300 Q650,320 550,280 T450,320 T350,280 T250,320 T150,280 Z" />
          {/* Add more paths if needed for a better "map" feel, or just abstract shapes */}
        </svg>

        {/* Hotspots */}
        {regions.map(r => (
          <div
            key={r.id}
            onMouseEnter={() => setHoveredRegion(r)}
            onMouseLeave={() => setHoveredRegion(null)}
            style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: 12,
              height: 12,
              background: r.importance === 'High' ? 'var(--red)' : 'var(--gold)',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: `0 0 15px ${r.importance === 'High' ? 'var(--red)' : 'var(--gold)'}`,
              animation: 'pulse 2s infinite',
              zIndex: 10
            }}
          >
            {/* Tooltip or Label on Hover/Always for mobile */}
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              background: 'var(--bg4)',
              border: '1px solid var(--border)',
              padding: '6px 10px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontWeight: 700,
              pointerEvents: 'none',
              opacity: hoveredRegion?.id === r.id ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 20
            }}>
              {r.name}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--text4)', fontWeight: 600 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} /> High Priority
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--text4)', fontWeight: 600 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} /> Medium Priority
          </div>
        </div>
      </div>

      {/* Info Panel for the selected region */}
      <div style={{ marginTop: 16, minHeight: 60 }}>
        {hoveredRegion ? (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>{hoveredRegion.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--indigo)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 4 }}>{hoveredRegion.tag}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>
              {hoveredRegion.news}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text4)', textAlign: 'center', paddingTop: 12, fontStyle: 'italic' }}>
            Tap or hover on hotspots to explore strategic exam focus areas.
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoMap;
