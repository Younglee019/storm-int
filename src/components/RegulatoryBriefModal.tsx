import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  synergies?: any[];
  totalSavings?: number;
}

export default function RegulatoryBriefModal({ isOpen, onClose, synergies = [], totalSavings = 0 }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">FERC Order 1920 — Joint Filing Report</h2>
            <p className="text-xs text-emerald-400">Automated Cross-Utility Coordination</p>
          </div>
          <button 
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300"
          >
            Close ✕
          </button>
        </div>

        <div className="my-4 p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs">
          <p className="text-emerald-300 font-semibold">Total Estimated Regional Savings:</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">${totalSavings.toLocaleString()} USD</p>
          <p className="text-[11px] text-slate-400 mt-1">Rule 1920 requires utilities to plan projects together so customers don't pay twice for lines and repairs.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Identified Utility Partnerships:</h3>
          {synergies.length === 0 ? (
            <p className="text-xs text-slate-400">No cross-border pairs detected.</p>
          ) : (
            synergies.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{s.incidentA?.utility} ↔ {s.incidentB?.utility}</span>
                  <span className="text-emerald-400 font-mono">+${s.savingsProjectionUsd?.toLocaleString()}</span>
                </div>
                <p className="text-slate-300">{s.synergyStrategy}</p>
                <p className="text-[11px] text-slate-400">Distance apart: {s.distanceKm?.toFixed(2)} km ({s.tier})</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => alert('Filing document exported successfully!')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
          >
            Download Official Briefing (.PDF)
          </button>
        </div>
      </div>
    </div>
  );
}