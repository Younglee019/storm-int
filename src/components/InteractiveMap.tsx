import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Props {
  incidents?: any[];
  hazards?: any[];
  synergies?: any[];
  crews?: any[];
  selectedIncident?: any;
  onSelectIncident?: (incident: any) => void;
  isDetourActive?: boolean;
}

export default function InteractiveMap({
  incidents = [],
  hazards = [],
  synergies = [],
  crews = [],
  selectedIncident = null,
  onSelectIncident,
  isDetourActive = false
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const animatedVehicleMarkerRef = useRef<L.Marker | null>(null);
  const animationIntervalRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered to cleanly frame Savannah, Effingham County, and Jasper County (SC)
    const map = L.map(mapContainerRef.current, {
      center: [32.22, -81.08],
      zoom: 10,
      zoomControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Official Free OpenStreetMap Tile Server (No API Key Required, No Watermarks)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Geospatial Layers & Detour Simulation
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    // Utility Color Palette
    const getUtilityColor = (utility: string) => {
      switch (utility) {
        case 'Dominion Energy SC':
          return '#2563eb'; // Blue
        case 'Georgia Power':
          return '#dc2626'; // Red
        case 'Duke Energy':
          return '#9333ea'; // Purple
        case 'Florida Power & Light (FPL)':
          return '#0284c7'; // Cyan
        default:
          return '#059669';
      }
    };

    // 1. Draw Substation Nodes (Federal DHS HIFLD coordinates)
    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const color = getUtilityColor(inc.utility);

      const marker = L.circleMarker([inc.location.lat, inc.location.lng], {
        radius: isSelected ? 11 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.95
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
          <b style="color: ${color}; font-size: 12px;">${inc.utility}</b><br/>
          <b>${inc.title}</b><br/>
          <span>Voltage: <b>${inc.voltageKv || 115} kV</b></span><br/>
          <span>Status: ${inc.status || 'Active Intertie'}</span><br/>
          <small style="color: #64748b;">Source: ${inc.dataSource || 'DHS HIFLD'}</small>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      layers.addLayer(marker);
    });

    // 2. Draw FERC 1920 Synergy Buffer Radii & Interties
    synergies.forEach((syn) => {
      const posA: [number, number] = [syn.incidentA.location.lat, syn.incidentA.location.lng];
      const posB: [number, number] = [syn.incidentB.location.lat, syn.incidentB.location.lng];

      // Regional Equipment Sharing Buffer (8km visual staging radius)
      const bufferCircle = L.circle(posA, {
        radius: 8000,
        color: '#059669',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#10b981',
        fillOpacity: 0.1
      });
      layers.addLayer(bufferCircle);

      // Synergy connector line
      const line = L.polyline([posA, posB], {
        color: '#059669',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.85
      });
      layers.addLayer(line);
    });

    // 3. Waymo Autonomous Telematics Route Corridors
    // Nominal route: GA-21 south through Port Wentworth into Savannah
    const nominalWaymoRoute: [number, number][] = [
      [32.355, -81.185],
      [32.338, -81.155], // Hazard location (downed pole / flood)
      [32.228, -81.15],
      [32.148, -81.144],
      [32.083, -81.099]
    ];

    // Detour bypass coordinates: Cut west to Old Augusta Rd via Rincon
    const detourWaymoRoute: [number, number][] = [
      [32.355, -81.185],
      [32.345, -81.235], // Old Augusta Rd Detour bypass
      [32.221, -81.238],
      [32.14, -81.16],
      [32.083, -81.099]
    ];

    if (!isDetourActive) {
      // Nominal Path (Cyan)
      const routeLine = L.polyline(nominalWaymoRoute, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.9
      });
      layers.addLayer(routeLine);
    } else {
      // Blocked Red Hazard Zone on GA-21
      const blockedLine = L.polyline(
        [
          [32.355, -81.185],
          [32.338, -81.155],
          [32.228, -81.15]
        ],
        {
          color: '#dc2626',
          weight: 4,
          dashArray: '6, 6',
          opacity: 0.95
        }
      );
      layers.addLayer(blockedLine);

      // Active Detour Path (Emerald Green)
      const detourLine = L.polyline(detourWaymoRoute, {
        color: '#059669',
        weight: 4,
        opacity: 0.95
      });
      layers.addLayer(detourLine);

      // Obstacle marker at hazard coordinates
      const hazardIcon = L.divIcon({
        className: 'hazard-icon-node',
        html: `<div style="background-color: #dc2626; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #dc2626;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const hazardMarker = L.marker([32.338, -81.155], { icon: hazardIcon });
      hazardMarker.bindPopup('<b>HAZ-201: Impassable</b><br/>18" standing water on GA-21.');
      layers.addLayer(hazardMarker);

      // 4. Moving Autonomous Vehicle Marker
      const carIcon = L.divIcon({
        className: 'av-vehicle-marker',
        html: `
          <div style="position: relative; display: flex; items-center; justify-content: center;">
            <div style="background-color: #0284c7; color: white; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 0 10px #0284c7;">
              W
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      let step = 0;
      const totalSteps = 40;
      const startPt = detourWaymoRoute[0];
      const midPt = detourWaymoRoute[1];
      const endPt = detourWaymoRoute[2];

      const vehicleMarker = L.marker(startPt, { icon: carIcon }).addTo(layers);
      animatedVehicleMarkerRef.current = vehicleMarker;

      animationIntervalRef.current = setInterval(() => {
        step = (step + 1) % (totalSteps + 1);
        const t = step / totalSteps;

        // Smooth quadratic path interpolation along the detour
        const lat =
          (1 - t) * (1 - t) * startPt[0] + 2 * (1 - t) * t * midPt[0] + t * t * endPt[0];
        const lng =
          (1 - t) * (1 - t) * startPt[1] + 2 * (1 - t) * t * midPt[1] + t * t * endPt[1];

        vehicleMarker.setLatLng([lat, lng]);
      }, 150);
    }
  }, [incidents, hazards, synergies, crews, selectedIncident, isDetourActive]);

  return (
    <div className="relative w-full h-full bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Tactical GIS Legend */}
      <div className="absolute bottom-3 left-3 z-[500] bg-slate-900/95 backdrop-blur border border-slate-700/80 p-2.5 rounded-lg text-[10px] space-y-1.5 shadow-2xl max-w-[210px]">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-1">
          <span className="font-bold text-white">Regional Intertie GIS</span>
          <span className="text-[9px] text-emerald-400 font-mono font-semibold">HIFLD Validated</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Dominion SC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Georgia Power</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Duke Energy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>FPL Florida</span>
          </div>
        </div>
        <div className="border-t border-slate-700/60 pt-1 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3.5 h-1 bg-sky-600 rounded"></span>
            <span>Nominal AV Route</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3.5 h-1 bg-emerald-600 rounded"></span>
            <span>Autonomous Detour</span>
          </div>
        </div>
      </div>
    </div>
  );
}