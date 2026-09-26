import React, { useState } from 'react';

interface Props {
  hazards: any[];
  onTriggerSimulation?: (status: boolean) => void;
}

export default function WaymoMobilityPanel({ hazards = [], onTriggerSimulation }: Props) {
  const [detourActive, setDetourActive] = useState(false);

  const toggleSimulation = () => {
    const nextState = !detourActive;
    setDetourActive(nextState);
    if (onTriggerSimulation) {
      onTriggerSimulation(nextState);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const message = nextState
        ? "Alert: Downed pole on GA-21. Rerouting Waymo fleet via Old Augusta Road."
        : "Primary corridor restored. Returning to standard route.";
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-white font-bold text-sm">Waymo Telematics</h3>
          <p className="text-[11px] text-slate-400">Live Road Hazard Feed</p>
        </div>
        <a 
          href="/api/hazards" 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 font-mono"
        >
          View API Feed ↗
        </a>
      </div>

      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
        <p className="text-xs text-slate-300 font-semibold mb-2">Simulate Storm Incident on Fleet:</p>
        <button
          onClick={toggleSimulation}
          className={`w-full py-2 px-3 font-bold text-xs rounded transition-all ${
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
            <p className="text-slate-400">Route moved from GA-21 to Old Augusta Road to keep vehicles safe from water and fallen lines.</p>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1">
        {hazards.map((h: any) => (
          <div key={h.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs">
            <div className="flex justify-between font-bold text-slate-200">
              <span>{h.corridor}</span>
              <span className={h.impassableForEV ? 'text-red-400' : 'text-amber-400'}>
                {h.impassableForEV ? 'Road Blocked' : 'Caution'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">Hazard: {h.type.replace('_', ' ')}</p>
            <p className="text-[10px] text-emerald-400 mt-1">Safe Path: {h.recommendedReroute}</p>
          </div>
        ))}
      </div>
    </div>
  );
}