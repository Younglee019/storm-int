import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Props {
  incidents: any[];
  hazards: any[];
  synergies: any[];
}

export default function InteractiveMap({ incidents, hazards, synergies }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate maps

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([32.28, -81.08], 11);
      mapInstanceRef.current = map;

      // CARTO Dark Matter Tiles (No API key needed)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const createCustomIcon = (color: string) =>
        L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

      // 1. Draw Synergy Corridors
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

      // 2. Plot Incidents
      incidents.forEach((inc) => {
        const isGPC = inc.utility.toLowerCase().includes('georgia');
        const color = isGPC ? '#ef4444' : '#3b82f6';

        L.marker([inc.location.lat, inc.location.lng], { icon: createCustomIcon(color) })
          .addTo(map)
          .bindPopup(`
            <div style="color: #0f172a; font-size: 12px; font-family: sans-serif;">
              <b style="text-transform: uppercase; font-size: 10px; color: #64748b;">${inc.utility}</b><br/>
              <strong style="font-size: 13px;">${inc.title}</strong><br/>
              Voltage: <b>${inc.voltageKv} kV</b><br/>
              Build Window: <b>${inc.startDate || 'N/A'} - ${inc.endDate || 'N/A'}</b>
            </div>
          `);
      });

      // 3. Plot Waymo Hazards
      hazards.forEach((haz) => {
        L.marker([haz.location.lat, haz.location.lng], { icon: createCustomIcon('#f59e0b') })
          .addTo(map)
          .bindPopup(`
            <div style="color: #0f172a; font-size: 12px; font-family: sans-serif;">
              <b style="color: #d97706; text-transform: uppercase; font-size: 10px;">Waymo Road Hazard</b><br/>
              <strong style="font-size: 13px;">${haz.corridor}</strong><br/>
              <span style="color: ${haz.impassableForEV ? '#dc2626' : '#d97706'}; font-weight: bold;">
                ${haz.impassableForEV ? '? Impassable for Autonomous Fleet' : '?? Proceed Under Caution'}
              </span><br/>
              Detour: <b>${haz.recommendedReroute}</b>
            </div>
          `);
      });

      setLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [incidents, hazards, synergies]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Floating GIS Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 border border-slate-700 p-3 rounded-lg backdrop-blur text-xs text-slate-300 space-y-1.5 shadow-2xl pointer-events-none">
        <div className="font-bold text-white mb-1 tracking-wide">GIS Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Dominion Energy SC
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Georgia Power
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Waymo Road Hazard
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block"></span> Sperry Synergy Corridor
        </div>
      </div>
    </div>
  );
}
