import React from 'react';
import { OverlapSynergy } from '../lib/spatial';
import { GridIncident } from '../types';
import { Zap, DollarSign, Radio, ArrowRight } from 'lucide-react';

interface Props {
  synergies: OverlapSynergy[];
  onPlayAlert: (text: string) => void;
  onSelectIncident: (inc: GridIncident) => void;
}

export default function UtilityOperationsPanel({ synergies, onPlayAlert, onSelectIncident }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 overflow-y-auto border-r border-slate-800">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          Sperry GridLock Engine
        </h2>
        <p className="text-xs text-slate-400">FERC Order 1920 Cross-Utility Coordination</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Ranked Opportunities</span>
          <span className="text-emerald-400 font-mono">{synergies.length} Flagged</span>
        </div>

        {synergies.map((syn, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500/60 transition cursor-pointer"
            onClick={() => onSelectIncident(syn.incidentA)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {syn.distanceKm} km apart
              </span>
              <span className="text-[11px] text-amber-400 font-medium">{syn.tier}</span>
            </div>

            <div className="mt-2 text-xs font-semibold text-white leading-snug">
              {syn.incidentA.title}
              <div className="text-slate-400 flex items-center gap-1 my-0.5">
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                {syn.incidentB.title}
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded border border-slate-800">
              {syn.synergyStrategy}
            </p>

            <div className="mt-2 text-[11px] text-slate-400">
              Concurrent Build Window: <b className="text-white">{syn.concurrentMonths} Months</b>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                Est. Savings: ${syn.savingsProjectionUsd.toLocaleString()}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAlert(
                    `FERC Order 1920 Synergy alert. Dominion Energy South Carolina and Georgia Power projects sit within ${syn.distanceKm} kilometers across the Savannah River corridor, with ${syn.concurrentMonths} concurrent build months. Estimated shared resource savings: ${syn.savingsProjectionUsd.toLocaleString()} dollars.`
                  );
                }}
                className="flex items-center gap-1 bg-slate-700 hover:bg-emerald-600 px-2.5 py-1 rounded text-white transition text-xs font-medium"
              >
                <Radio className="w-3 h-3" /> Voice Alert
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}