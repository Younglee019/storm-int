import React, { useState, useEffect } from 'react';

interface Props {
  hazards?: any[];
  onTriggerSimulation?: (status: boolean) => void;
}

export default function WaymoMobilityPanel({ hazards = [], onTriggerSimulation }: Props) {
  const [detourActive, setDetourActive] = useState(false);
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hazards' | 'liveDot'>('hazards');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchLiveFeed() {
      try {
        setIsLoading(true);
        // Try fetching live weather alerts first; fallback to live incidents if needed
        const res = await fetch('/api/live-weather');
        if (res.ok) {
          const data = await res.json();
          setLiveIncidents(data.alerts || data.incidents || []);
        } else {
          const fallbackRes = await fetch('/api/live-incidents');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setLiveIncidents(fallbackData.incidents || []);
          }
        }
      } catch (err) {
        console.error('Failed to load real-time incident feed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLiveFeed();
  }, []);

  const toggleSimulation = () => {
    const nextState = !detourActive;
    setDetourActive(nextState);
    if (onTriggerSimulation) {
      onTriggerSimulation(nextState);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const message = nextState
        ? 'Alert: Downed pole on GA-21. Rerouting Waymo fleet via Old Augusta Road.'
        : 'Primary corridor restored. Returning to standard route.';
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-white font-bold text-sm">Waymo Telematics</h3>
          <p className="text-[11px] text-slate-400">Live Infrastructure & CAD 911 Feed</p>
        </div>
        <div className="flex gap-1.5">
          <a
            href="/api/live-weather"
            target="_blank"
            rel="noreferrer"
            className="text-[9px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded border border-slate-700 font-mono transition-colors"
          >
            Live NOAA ↗
          </a>
          <a
            href="/api/hazards"
            target="_blank"
            rel="noreferrer"
            className="text-[9px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 font-mono transition-colors"
          >
            Hazards API ↗
          </a>
        </div>
      </div>

      {/* Simulator Trigger */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
        <p className="text-xs text-slate-300 font-semibold mb-2">Simulate Storm Incident on Fleet:</p>
        <button
          onClick={toggleSimulation}
          className={`w-full py-2 px-3 font-bold text-xs rounded transition-all shadow-sm ${
            detourActive
              ? 'bg-red-500 hover:bg-red-400 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          {detourActive ? '✕ Reset to Primary Route' : '▶ Simulate Hazard & Reroute'}
        </button>

        {detourActive && (
          <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300">
            <p className="font-bold">⚠️ Detour Activated</p>
            <p className="text-slate-400">Route diverted from GA-21 to Old Augusta Road to maintain vehicle clearance.</p>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 mt-3 text-xs">
        <button
          onClick={() => setActiveTab('hazards')}
          className={`flex-1 py-1.5 text-center font-semibold transition-colors ${
            activeTab === 'hazards'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AV Road Hazards ({hazards.length})
        </button>
        <button
          onClick={() => setActiveTab('liveDot')}
          className={`flex-1 py-1.5 text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'liveDot'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live NOAA / 911 ({liveIncidents.length})
        </button>
      </div>

      {/* Scrollable Feed List */}
      <div className="mt-2 space-y-2 overflow-y-auto flex-1 pr-1">
        {activeTab === 'hazards' ? (
          hazards.map((h: any) => (
            <div key={h.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>{h.corridor}</span>
                <span className={h.impassableForEV ? 'text-red-400' : 'text-amber-400'}>
                  {h.impassableForEV ? 'Road Blocked' : 'Caution'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Disruption: <span className="text-slate-300 font-medium">{h.type.replace(/_/g, ' ')}</span>
              </p>
              <p className="text-[10px] text-emerald-400">Safe Path: {h.recommendedReroute}</p>
            </div>
          ))
        ) : isLoading ? (
          <p className="text-xs text-slate-500 italic p-3 text-center">Connecting to real-time feeds...</p>
        ) : (
          liveIncidents.map((incident: any) => (
            <div key={incident.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">{incident.corridor || incident.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {incident.type || 'WEATHER_ALERT'}
                </span>
              </div>

              {/* Headline / Advisory Body */}
              <p className="text-slate-300 text-[11px] leading-snug">
                {incident.headline || incident.title || 'Official advisory in effect across regional coastal corridors.'}
              </p>

              {/* Agency and Road Status Line */}
              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                <span>
                  Agency: <b className="text-slate-300">{incident.agency || incident.source || 'NOAA / NWS Charleston'}</b>
                </span>
                <span className="text-amber-400 font-mono">
                  {incident.roadStatus || (incident.impassableForEV ? 'ROAD RESTRICTED' : 'ADVISORY MONITORING')}
                </span>
              </div>

              {/* Vehicle / Routing Impact Line */}
              <p className="text-[10px] text-cyan-400">
                Impact:{' '}
                <span className="text-slate-300">
                  {incident.evRoutingImpact ||
                    (incident.impassableForEV
                      ? 'Sensor obstruction & high-water risk'
                      : 'Optical telemetry caution advised')}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}