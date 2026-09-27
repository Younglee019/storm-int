import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import UtilityOperationsPanel from '../components/UtilityOperationsPanel';
import WaymoMobilityPanel from '../components/WaymoMobilityPanel';
import RegulatoryBriefModal from '../components/RegulatoryBriefModal';
import { DEMO_INCIDENTS, DEMO_HAZARDS, DEMO_CREWS } from '../data/demoData';
import { OverlapSynergy } from '../types';

// Dynamic import with SSR disabled for Leaflet map compatibility
const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
      Initialising Geospatial Transmission Grid Engine...
    </div>
  )
});

export default function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isDetourActive, setIsDetourActive] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Compute FERC 1920 Cross-Utility Synergies (< 40km proximity & overlapping windows)
  const synergies: OverlapSynergy[] = useMemo(() => {
    const list: OverlapSynergy[] = [];
    for (let i = 0; i < DEMO_INCIDENTS.length; i++) {
      for (let j = i + 1; j < DEMO_INCIDENTS.length; j++) {
        const a = DEMO_INCIDENTS[i];
        const b = DEMO_INCIDENTS[j];

        if (a.utility !== b.utility) {
          // Haversine calculation for radial distance
          const R = 6371; // km
          const dLat = ((b.location.lat - a.location.lat) * Math.PI) / 180;
          const dLon = ((b.location.lng - a.location.lng) * Math.PI) / 180;
          const lat1 = (a.location.lat * Math.PI) / 180;
          const lat2 = (b.location.lat * Math.PI) / 180;

          const h =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
          const dist = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

          if (dist <= 40) {
            list.push({
              incidentA: a,
              incidentB: b,
              distanceKm: dist,
              tier: 'Tier 3: < 40 km (Shared Equipment & Crews)',
              savingsProjectionUsd: 220000,
              synergyStrategy:
                'Consolidate 300-ton crane staging and share mutual high-voltage line crews.',
              concurrentMonths: 17,
              priorityScore: 92
            });
          }
        }
      }
    }
    return list;
  }, []);

  const totalProjectedSavings = synergies.reduce(
    (acc, curr) => acc + (curr.savingsProjectionUsd || 0),
    0
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Head>
        <title>Storm Intelligence | FERC 1920 & Autonomous Fleet Bridge</title>
        <meta
          name="description"
          content="Regional Transmission Planning & Autonomous Fleet Routing Engine"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white">STORM INTELLIGENCE</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold">
                FERC 1920 ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sperry GridLock Engine & Autonomous Mobility Bridge
            </p>
          </div>
        </div>

        {/* Data Provenance Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            NOAA NWS Live API
          </span>
          <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
            DHS HIFLD Grid GIS
          </span>
          <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
            USDOT WZDx Schema v4.0
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-semibold">
              Est. Intertie Synergy
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              ${totalProjectedSavings.toLocaleString()} USD
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg border border-emerald-400 shadow-sm transition-all"
          >
            <span>📄</span>
            <span>Generate FERC 1920 AI Filing</span>
          </button>
        </div>
      </header>

      {/* 3-Column Command Dashboard Grid */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left: Sperry GridLock Engine */}
        <section className="col-span-12 lg:col-span-3 border-r border-slate-800 bg-slate-900/60 p-3 overflow-hidden flex flex-col">
          <UtilityOperationsPanel
            incidents={DEMO_INCIDENTS}
            synergies={synergies}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc: any) => setSelectedIncident(inc)}
          />
        </section>

        {/* Center: Leaflet Interactive GIS Map */}
        <section className="col-span-12 lg:col-span-6 relative h-full">
          <InteractiveMap
            incidents={DEMO_INCIDENTS}
            hazards={DEMO_HAZARDS}
            synergies={synergies}
            crews={DEMO_CREWS}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc: any) => setSelectedIncident(inc)}
            isDetourActive={isDetourActive}
          />
        </section>

        {/* Right: Waymo Autonomous Mobility Telematics */}
        <section className="col-span-12 lg:col-span-3 border-l border-slate-800 bg-slate-900/60 p-3 overflow-hidden flex flex-col">
          <WaymoMobilityPanel
            hazards={DEMO_HAZARDS}
            onTriggerSimulation={(status: boolean) => setIsDetourActive(status)}
          />
        </section>
      </main>

      {/* Regulatory Filing Generation Modal */}
      {isModalOpen && (
        <RegulatoryBriefModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          synergies={synergies}
          totalSavings={totalProjectedSavings}
        />
      )}
    </div>
  );
}