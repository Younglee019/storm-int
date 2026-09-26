import React, { useState } from 'react';

interface Props {
  hazards: any[];
  onTriggerSimulation?: (status: boolean) => void;
}

export default function WaymoMobilityPanel({ hazards, onTriggerSimulation }: Props) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [detourActive, setDetourActive] = useState(false);

  const startSimulation = () => {
    setIsSimulating(true);
    setDetourActive(false);
    if (onTriggerSimulation) onTriggerSimulation(false);

    // Speak departure
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance('Waymo Mission Dispatched: Savannah Port to Rincon via GA-21.')
      );
    }

    // Trigger hazard encounter after 3 seconds
    setTimeout(() => {
      setDetourActive(true);
      if (onTriggerSimulation) onTriggerSimulation(true);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(
            'Hazard Alert: Impassable 18-inch standing water on GA-21. Initiating dynamic reroute via Old Augusta Road.'
          )
        );
      }
    }, 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2 text-sm">
            <span className="text-amber-400">⚡</span> Waymo Fleet Telematics
          </h3>
          <p className="text-[11px] text-slate-400">Autonomous ODD & Risk Ingestion</p>
        </div>
        <a 
          href="/api/v1/telematics/hazards" 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 font-mono"
        >
          API Feed ↗
        </a>
      </div>

      {/* Interactive Fleet Dispatch Simulator */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium">Mission: Savannah $\rightarrow$ Rincon</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            detourActive 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : isSimulating 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {detourActive ? 'DETOUR ACTIVE' : isSimulating ? 'PRIMARY ROUTE' : 'READY'}
          </span>
        </div>

        <button
          onClick={startSimulation}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-all shadow-md active:scale-95"
        >
          {isSimulating ? '🔄 Re-run AV Trip Simulation' : '▶ Simulate Autonomous Trip'}
        </button>

        {detourActive && (
          <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300 space-y-1">
            <div>⚠️ <b>Hazard Encountered:</b> GA-21 Standing Water (18 in)</div>
            <div>🔄 <b>Autonomous Detour:</b> Old Augusta Rd via Rincon</div>
            <div className="text-slate-400 text-[10px]">Telemetry Delta: Battery +4.8 kWh | Est. delay: +8 min</div>
          </div>
        )}
      </div>

      {/* Hazard Cards List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1">
        {hazards.map((h: any) => (
          <div key={h.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-200">{h.corridor}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                h.impassableForEV ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {h.impassableForEV ? 'Blocked for AV' : 'Caution Zone'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mb-1">
              Disruption: <span className="text-slate-300 capitalize">{h.type.replace('_', ' ')}</span>
            </p>
            <div className="p-1.5 bg-slate-900 rounded text-[10px] text-slate-300 border border-slate-800/80">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Recommended Detour</span>
              {h.recommendedReroute}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}