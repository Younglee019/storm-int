import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { DEMO_INCIDENTS, DEMO_HAZARDS, DEMO_CREWS } from '../data/demoData';
import { detectCrossBorderSynergies } from '../lib/spatial';
import UtilityOperationsPanel from '../components/UtilityOperationsPanel';
import WaymoMobilityPanel from '../components/WaymoMobilityPanel';
import RegulatoryBriefModal from '../components/RegulatoryBriefModal';

// Dynamically import InteractiveMap with SSR disabled to prevent Leaflet window errors
const DynamicMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-mono">Initializing GIS Engine & Spatial Layers...</span>
    </div>
  ),
});

export default function Home() {
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetourActive, setIsDetourActive] = useState(false);

  // Compute spatial synergy clusters dynamically based on current grid incidents
  const synergies = useMemo(() => {
    return detectCrossBorderSynergies(DEMO_INCIDENTS);
  }, []);

  // Calculate cumulative regional cost savings across all flagged utility corridors
  const totalProjectedSavings = useMemo(() => {
    return synergies.reduce((acc, curr) => acc + (curr.savingsProjectionUsd || 0), 0);
  }, [synergies]);

  return (
    <>
      <Head>
        <title>Storm Intelligence | FERC 1920 & Waymo Telematics</title>
        <meta
          name="description"
          content="Geospatial coordination bridge for regional transmission grids and autonomous mobility fleets."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                STORM INTELLIGENCE
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest font-mono">
                  FERC 1920 Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Sperry GridLock Engine & Autonomous Mobility Bridge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Est. Intertie Synergy
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ${totalProjectedSavings.toLocaleString()} USD
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generate FERC 1920 AI Filing
            </button>
          </div>
        </header>

        {/* 3-Column Operational Layout */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Panel: Sperry GridLock Cross-Utility Engine */}
          <section className="col-span-12 lg:col-span-3 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
            <UtilityOperationsPanel
              incidents={DEMO_INCIDENTS}
              synergies={synergies}
              selectedIncident={selectedIncident}
              onSelectIncident={(incident) => setSelectedIncident(incident)}
            />
          </section>

          {/* Center Panel: Full Leaflet Geospatial View */}
          <section className="col-span-12 lg:col-span-6 h-full relative">
            <DynamicMap
              incidents={DEMO_INCIDENTS}
              hazards={DEMO_HAZARDS}
              crews={DEMO_CREWS}
              synergies={synergies}
              selectedIncident={selectedIncident}
              onSelectIncident={(incident: any) => setSelectedIncident(incident)}
              isDetourActive={isDetourActive}
            />
          </section>

          {/* Right Panel: Waymo Mobility Telematics & Dispatch Simulator */}
          <section className="col-span-12 lg:col-span-3 border-l border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
            <WaymoMobilityPanel
              hazards={DEMO_HAZARDS}
              onTriggerSimulation={(detourStatus: boolean) => setIsDetourActive(detourStatus)}
            />
          </section>
        </div>

        {/* Modal: Live FERC Order No. 1920 Compliance Document */}
        {isModalOpen && (
          <RegulatoryBriefModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            synergies={synergies}
            totalSavings={totalProjectedSavings}
          />
        )}
      </main>
    </>
  );
}