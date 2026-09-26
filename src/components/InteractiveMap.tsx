import React, { useEffect, useState, useRef } from 'react';

interface Props {
  incidents: any[];
  hazards: any[];
  synergies: any[];
  isDetourActive?: boolean;
}

export default function InteractiveMap({ incidents, hazards, synergies, isDetourActive }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayersRef = useRef<{ primary?: any; detour?: any }>({});
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

    const map = L.map(mapContainerRef.current).setView([32.28, -81.12], 10);
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

    // 1. Hurricane Wind Cone Overlay
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
      }).addTo(map);
    }

    // 2. Sperry Synergies
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

    // 3. Grid Incidents
    incidents.forEach((inc) => {
      let color = '#3b82f6';
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
            Voltage: <b>${inc.voltageKv} kV</b>
          </div>
        `);
    });

    // 4. Waymo Hazards
    hazards.forEach((haz) => {
      L.marker([haz.location.lat, haz.location.lng], { icon: makePin('#f59e0b') })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-size: 12px; font-family: sans-serif;">
            <b style="color: #d97706; text-transform: uppercase; font-size: 10px;">Waymo Road Hazard</b><br/>
            <strong style="font-size: 13px;">${haz.corridor}</strong><br/>
            Detour: <b>${haz.recommendedReroute}</b>
          </div>
        `);
    });

    // 5. Waymo Autonomous Route Simulation Polylines
    const primaryRoute: [number, number][] = [
      [32.0835, -81.0998], // Savannah Port
      [32.18, -81.14],
      [32.338, -81.155],  // Encounter Hazard
      [32.35, -81.23]     // Rincon
    ];

    const detourRoute: [number, number][] = [
      [32.0835, -81.0998], // Savannah Port
      [32.12, -81.19],
      [32.22, -81.24],    // Old Augusta Rd Bypass
      [32.35, -81.23]     // Rincon
    ];

    if (!isDetourActive) {
      // Primary Route in Bright Cyan
      routeLayersRef.current.primary = L.polyline(primaryRoute, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.85
      }).addTo(map).bindPopup('<b>Waymo Mission 104</b><br>Primary Route via GA-21');
    } else {
      // Impassable Primary in Red + Active Detour in Emerald Green
      routeLayersRef.current.primary = L.polyline(primaryRoute, {
        color: '#ef4444',
        weight: 4,
        dashArray: '5, 10',
        opacity: 0.6
      }).addTo(map);

      routeLayersRef.current.detour = L.polyline(detourRoute, {
        color: '#10b981',
        weight: 6,
        opacity: 0.95
      }).addTo(map).bindPopup('<b>Waymo Autonomous Detour</b><br>Bypassing GA-21 via Old Augusta Rd').openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ready, incidents, hazards, synergies, showStormCone, isDetourActive]);

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
          <span className="w-4 h-1 bg-cyan-400 inline-block rounded"></span> Nominal AV Route
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-emerald-500 inline-block rounded"></span> Autonomous Detour
        </div>
      </div>
    </div>
  );
}