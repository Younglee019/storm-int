import React, { useState } from 'react';
import Head from 'next/head';
import InteractiveMap from '../components/InteractiveMap';
import UtilityOperationsPanel from '../components/UtilityOperationsPanel';
import WaymoMobilityPanel from '../components/WaymoMobilityPanel';
import { DEMO_INCIDENTS, DEMO_HAZARDS, DEMO_CREWS } from '../data/demoData';
import { detectCrossBorderSynergies } from '../lib/spatial';
import { GridIncident } from '../types';
import { Bot, Shield, Activity } from 'lucide-react';

export default function Home() {
  const [selectedIncident, setSelectedIncident] = useState<GridIncident | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const synergies = detectCrossBorderSynergies(DEMO_INCIDENTS);

  const handlePlayVoice = async (text: string) => {
    try {
      const res = await fetch('/api/voice-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.headers.get('Content-Type')?.includes('audio/mpeg')) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
      } else {
        // Instant Browser Web Speech API fallback if no external API key is set
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const handleGenerateAiBriefing = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Generate emergency FERC 1920 joint compliance briefing for the Savannah Basin corridor.' })
      });
      const data = await res.json();
      setAiReport(data.briefing);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans overflow-hidden">
      <Head>
        <title>Storm Intelligence | Sperry & Waymo Coordination</title>
      </Head>

      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">STORM INTELLIGENCE</h1>
            <p className="text-[10px] text-slate-400">Sperry Tech & Waymo Mobility Geospatial Bridge</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiBriefing}
            disabled={loadingAi}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded font-medium transition disabled:opacity-50"
          >
            <Bot className="w-4 h-4" />
            {loadingAi ? 'Synthesizing...' : 'Generate FERC 1920 AI Filing'}
          </button>
        </div>
      </header>

      {/* Main 3-Column Cockpit Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Sperry GridLock Engine */}
        <div className="w-80 md:w-96 h-full flex-shrink-0">
          <UtilityOperationsPanel
            synergies={synergies}
            onPlayAlert={handlePlayVoice}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        {/* Center: Live Interactive Map */}
        <div className="flex-1 h-full relative">
          <InteractiveMap
            incidents={DEMO_INCIDENTS}
            hazards={DEMO_HAZARDS}
            crews={DEMO_CREWS}
            synergies={synergies}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />

          {/* AI Regulatory Report Modal */}
          {aiReport && (
            <div className="absolute top-4 right-4 z-20 w-96 max-h-[85%] bg-slate-900/95 border border-emerald-500 p-4 rounded-xl shadow-2xl backdrop-blur overflow-y-auto text-slate-200 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> FERC Order 1920 Regulatory Briefing
                </span>
                <button onClick={() => setAiReport(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans leading-relaxed text-slate-300 text-xs">
                {aiReport}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Waymo Mobility Panel */}
        <div className="w-72 md:w-80 h-full flex-shrink-0">
          <WaymoMobilityPanel hazards={DEMO_HAZARDS} />
        </div>
      </div>
    </div>
  );
}