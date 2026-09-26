import React from 'react';
import { RoadHazard } from '../types';
import { Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  hazards: RoadHazard[];
}

export default function WaymoMobilityPanel({ hazards }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 overflow-y-auto border-l border-slate-800">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-amber-400" />
          Waymo Mobility Telematics
        </h2>
        <p className="text-xs text-slate-400">Autonomous Fleet Road Risk Ingestion</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Active Road Hazards ({hazards.length})
        </div>

        {hazards.map((haz) => (
          <div key={haz.id} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{haz.corridor}</span>
              {haz.impassableForEV ? (
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Blocked for AV
                </span>
              ) : (
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Caution Zone
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 mt-2">
              Disruption Type: <span className="capitalize text-white font-medium">{haz.type.replace(/_/g, ' ')}</span>
            </div>

            <div className="text-xs bg-slate-950/80 p-2 rounded border border-slate-800 mt-2 text-emerald-300">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Detour:</span>
              {haz.recommendedReroute}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}