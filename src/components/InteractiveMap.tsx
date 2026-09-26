import React, { useEffect, useState, useRef } from 'react';

interface Props {
  incidents: any[];
  hazards: any[];
  synergies: any[];
  crews?: any[];
  selectedIncident?: any;
  onSelectIncident?: (incident: any) => void;
}

export default function InteractiveMap({ incidents, hazards, synergies }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [showStormCone, setShowStormCone] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        await new Promise((resolve) => {
          if (document.getElementById('leaflet-js')) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve(true);
          document.body.appendChild(script);
        });
      }
      setReady(true);
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!ready || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([31.8, -81.4], 8);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const makePin = (color: string) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

    // 1. Hurricane Category-3 Vector Projection Cone
    if (showStormCone) {
      const stormCoordinates: [number, number][] = [
        [29.8, -80.5],
        [31.2, -81.1],
        [32.6, -81.3],
        [34.1, -81.8],
        [33.9, -82.6],
        [31.8, -82.2],
        [29.9, -81.3]
      ];

      L.polygon(stormCoordinates, {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map).bindPopup('<b>NOAA Cat-3 Hurricane Trajectory Cone</b><br>Sustained Winds: 115 MPH<br>Surge Risk: High');
    }

    // 2. Sperry Synergy Lines and Coverage Radii
    synergies.forEach((syn) => {
      L.polyline(
        [
          [syn.incidentA.location.lat, syn.incidentA.location.lng],
          [syn.incidentB.location.lat, syn.incidentB.location.lng]
        ],
        { color: '#10b981', weight: 2.5, dashArray: '6, 6' }
      ).addTo(map);

      L.circle([syn.incidentA.location.lat, syn.incidentA.location.lng], {
        radius: syn.distanceKm * 500,
        color: '#10b981',
        fillOpacity: 0.05
      }).addTo(map);
    });

    // 3. Multi-Utility Grid Incidents
    incidents.forEach((inc) => {
      let color = '#3b82f6'; // Default Dominion
      const util = inc.utility.toLowerCase();
      if (util.includes('georgia')) color = '#ef4444';
      else if (util.includes('duke')) color = '#a855f7';
      else if (util.includes('florida') || util.includes('fpl')) color = '#06b6d4';

      L.marker([inc.location.lat, inc.location.lng], { icon: makePin(color) })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-size: 12px; font-family: sans-serif;">
            <b style="text-transform: uppercase; font-size: 10px; color: #64748b;">${inc.utility}</b><br/>
            <strong style="font-size: 13px;">${inc.title}</strong><br/>
            Operating Voltage: <b>${inc.voltageKv} kV</b><br/>
            Customers Affected: <b>${inc.customersOut?.toLocaleString() || 'N/A'}</b><br/>
            Timeline: <b>${inc.startDate || 'N/A'} to ${inc.endDate || 'N/A'}</b>
          </div>
        `);
    });

    // 4. Waymo Autonomous Telematics Hazards
    hazards.forEach((haz) => {
      L.marker([haz.location.lat, haz.location.lng], { icon: makePin('#f59e0b') })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-size: 12px; font-family: sans-serif;">
            <b style="color: #d97706; text-transform: uppercase; font-size: 10px;">Waymo Mobility Hazard</b><br/>
            <strong style="font-size: 13px;">${haz.corridor}</strong><br/>
            <span style="color: ${haz.impassableForEV ? '#dc2626' : '#d97706'}; font-weight: bold;">
              ${haz.impassableForEV ? '⛔ Impassable for AV Fleet' : '⚠️ Proceed Under Caution'}
            </span><br/>
            Water Depth: <b>${haz.waterDepthInches || 0} in</b> | Detour Drain: <b>+${haz.batteryImpactKw || 0} kWh</b><br/>
            Detour: <b>${haz.recommendedReroute}</b>
          </div>
        `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ready, incidents, hazards, synergies, showStormCone]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Floating Control & GIS Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 border border-slate-700 p-3 rounded-lg backdrop-blur text-xs text-slate-300 space-y-1.5 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-1.5">
          <span className="font-bold text-white tracking-wide">Regional Intertie GIS</span>
          <button
            onClick={() => setShowStormCone(!showStormCone)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              showStormCone ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {showStormCone ? '🌪️ Storm Cone: ON' : '🌪️ Storm Cone: OFF'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Dominion SC
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Georgia Power
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Duke Energy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> FPL
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Waymo Road Hazard
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block"></span> Sperry Synergy Corridor
        </div>
      </div>
    </div>
  );
}