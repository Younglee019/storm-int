import React from 'react';

interface Props {
  incidents?: any[];
  synergies?: any[];
  selectedIncident?: any;
  onSelectIncident?: (incident: any) => void;
  onPlayAlert?: (message?: any) => void;
}

export default function UtilityOperationsPanel({
  incidents = [],
  synergies = [],
  selectedIncident = null,
  onSelectIncident,
  onPlayAlert = (message?: any) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const text =
        typeof message === 'string'
          ? message
          : 'Dispatch alert: high-voltage transmission overlap detected.';
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  }
}: Props) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Sperry GridLock Engine</h2>
          <p className="text-[11px] text-slate-400">FERC Order 1920 Synergy Tracking</p>
        </div>
        <button
          onClick={() => onPlayAlert('Alert: Regional transmission intertie overlap detected.')}
          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 rounded text-[11px] font-bold transition-colors"
        >
          🔊 Voice Alert
        </button>
      </div>

      {/* Synergies Section */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          Detected Regional Synergies ({synergies.length})
        </span>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {synergies.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No spatial overlaps identified.</p>
          ) : (
            synergies.map((syn, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-emerald-900/40 rounded-lg text-xs space-y-1.5 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">{syn.tier}</span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    +${syn.savingsProjectionUsd?.toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <b>{syn.incidentA?.utility}</b> ↔ <b>{syn.incidentB?.utility}</b>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">{syn.synergyStrategy}</p>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Distance: {syn.distanceKm?.toFixed(2)} km</span>
                  <span>Overlap: {syn.concurrentMonths} mos</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid Incidents Section */}
      <div className="flex-1 space-y-2 overflow-hidden flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          High-Voltage Grid Assets ({incidents.length})
        </span>
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident && onSelectIncident(inc)}
              className={`p-2.5 bg-slate-950 border rounded-lg text-xs cursor-pointer transition-colors ${
                selectedIncident?.id === inc.id
                  ? 'border-cyan-500 bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200">{inc.title}</span>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">{inc.voltageKv} kV</span>
              </div>
              <p className="text-[11px] text-slate-400">{inc.utility} • {inc.address}</p>
              <p className="text-[10px] text-slate-500 mt-1">Data Source: {inc.dataSource || 'HIFLD Verified'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}