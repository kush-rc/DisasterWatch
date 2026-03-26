'use client';

import { useStore } from '@/lib/store/useStore';
import type { ShaderMode } from '@/types';

const LAYER_GROUPS = [
  {
    title: 'DISASTER FEEDS',
    layers: [
      { key: 'earthquakes' as const, label: 'Earthquakes', icon: '◉', color: 'var(--red)' },
      { key: 'fires' as const, label: 'Fire Hotspots', icon: '🔥', color: 'var(--orange)' },
      { key: 'floods' as const, label: 'Floods', icon: '◈', color: 'var(--cyan)' },
      { key: 'cyclones' as const, label: 'Cyclones', icon: '◎', color: 'var(--amber)' },
    ]
  },
  {
    title: 'TRACKING',
    layers: [
      { key: 'satellites' as const, label: 'Satellites', icon: '◦', color: 'var(--cyan)' },
      { key: 'flights' as const, label: 'Aircraft', icon: '✈', color: '#8b5cf6' },
      { key: 'ships' as const, label: 'Ships (AIS)', icon: '⚓', color: 'var(--green)' },
    ]
  },
  {
    title: 'INTELLIGENCE',
    layers: [
      { key: 'weather' as const, label: 'Weather', icon: '☁', color: '#64748b' },
      { key: 'news' as const, label: 'News Pins', icon: '◆', color: 'var(--amber)' },
      { key: 'conflict' as const, label: 'Conflict (ACLED)', icon: '⚠', color: 'var(--red)' },
    ]
  }
];

const SHADER_MODES: { mode: ShaderMode; label: string; color: string }[] = [
  { mode: 'STANDARD', label: 'STD', color: 'var(--text)' },
  { mode: 'NVG', label: 'NVG', color: '#22c55e' },
  { mode: 'FLIR', label: 'FLIR', color: '#ef4444' },
  { mode: 'CRT', label: 'CRT', color: '#a3e635' },
  { mode: 'ANIME', label: 'ANI', color: '#f472b6' },
];

export default function LayerControls() {
  const layers = useStore(state => state.layers);
  const toggleLayer = useStore(state => state.toggleLayer);
  const leftPanelOpen = useStore(state => state.leftPanelOpen);
  const setLeftPanelOpen = useStore(state => state.setLeftPanelOpen);
  const shaderMode = useStore(state => state.shaderMode);
  const setShaderMode = useStore(state => state.setShaderMode);
  const flightCount = useStore(state => state.flightCount);
  const satelliteCount = useStore(state => state.satelliteCount);
  const shipCount = useStore(state => state.shipCount);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center pointer-events-auto"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          color: 'var(--cyan)',
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
        }}
        title="Toggle Layer Controls (L)"
      >
        {leftPanelOpen ? '✕' : '☰'}
      </button>

      {/* Panel */}
      {leftPanelOpen && (
        <div className="absolute top-16 left-4 z-20 w-[260px] pointer-events-auto" style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <div className="panel p-4 space-y-4" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)' }}>

            {/* Shader Modes */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                VISUAL MODE {'[M]'}
              </p>
              <div className="flex gap-1">
                {SHADER_MODES.map(s => (
                  <button
                    key={s.mode}
                    onClick={() => setShaderMode(s.mode)}
                    className="flex-1 py-1.5 text-[10px] font-bold rounded transition-all"
                    style={{
                      background: shaderMode === s.mode ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: shaderMode === s.mode ? '1px solid ' + s.color : '1px solid transparent',
                      color: shaderMode === s.mode ? s.color : 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border)' }} />

            {/* Layer Groups */}
            {LAYER_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.layers.map(layer => {
                    const isOn = layers[layer.key];
                    const count = layer.key === 'flights' ? flightCount :
                                  layer.key === 'satellites' ? satelliteCount :
                                  layer.key === 'ships' ? shipCount : null;
                    return (
                      <button
                        key={layer.key}
                        onClick={() => toggleLayer(layer.key)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all"
                        style={{
                          background: isOn ? 'rgba(255,255,255,0.05)' : 'transparent',
                          color: isOn ? layer.color : 'var(--muted)',
                          fontFamily: 'var(--font-mono)',
                          opacity: isOn ? 1 : 0.5,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">{layer.icon}</span>
                          <span>{layer.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {count !== null && count > 0 && (
                            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{count}</span>
                          )}
                          <span className="w-2 h-2 rounded-full" style={{
                            background: isOn ? layer.color : 'var(--muted)',
                            opacity: isOn ? 1 : 0.3,
                          }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
    </>
  );
}
