import React, { useState } from 'react';
import { OverlapSynergy } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  synergies: OverlapSynergy[];
  totalSavings: number;
}

export default function RegulatoryBriefModal({
  isOpen,
  onClose,
  synergies = [],
  totalSavings = 880000
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filingDocumentText = `UNITED STATES OF AMERICA
FEDERAL ENERGY REGULATORY COMMISSION (FERC)
18 CFR Part 35 | Docket No. RM21-17-000; Order No. 1920

JOINT REGIONAL TRANSMISSION PLANNING FILING & COST ALLOCATION ASSESSMENT
SOUTHEAST REGIONAL TRANSMISSION PLANNING REGION (SERTP / GA-SC INTERTIE)

I. APPLICANT UTILITIES & CO-PLANNING PARTICIPANTS
   1. Georgia Power Company (Southern Company Transmission Planning Region)
   2. Dominion Energy South Carolina (DESCS Regional Operations)
   3. Florida Power & Light (FPL - Cross-Border Intertie Coordination)

II. EXECUTIVE SUMMARY & STATUTORY PURPOSE
   Pursuant to FERC Order No. 1920, requiring transmission-providing public utilities 
   to conduct long-term regional transmission planning across a minimum 20-year horizon, 
   the Sperry GridLock Spatial Engine has evaluated transmission asset co-location within 
   the Savannah River Basin and Coastal Intertie corridors.

III. IDENTIFIED REGIONAL SPATIAL SYNERGIES & STAGING CO-LOCATION
${synergies
  .map(
    (syn, i) => `   Opportunity #${i + 1}:
   - Participating Entities: ${syn.incidentA?.utility} & ${syn.incidentB?.utility}
   - Asset Pairing: ${syn.incidentA?.title} (${syn.incidentA?.voltageKv} kV) <-> ${syn.incidentB?.title} (${syn.incidentB?.voltageKv} kV)
   - Geospatial Separation: ${syn.distanceKm?.toFixed(2)} km (< 40 km Regional Threshold)
   - Operational Strategy: ${syn.synergyStrategy}    - Estimated Capital & Mutual Aid Savings: $${syn.savingsProjectionUsd?.toLocaleString()} USD
`
  )
  .join('\n')}

IV. TOTAL PROJECTED CAPITAL & CONTINGENCY AVOIDANCE
   Total Quantified Benefit: $${totalSavings.toLocaleString()} USD
   Metric: Cost Allocation Factor via Benefit-to-Cost Ratio (BCR) > 1.25 under Order 1920.

V. INTER-SECTOR MOBILITY INTEGRATION (WAYMO AV TELEMATICS)
   Substation event telemetry is linked via open-standard REST APIs (USDOT WZDx Schema v4.0) 
   to mitigate fleet vulnerability during regional power interruptions and maintain evacuation 
   corridor throughput.

DATED: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
SUBMITTED BY: Storm Intelligence Regional Transmission Planning Consortium
REGULATORY REPOSITORY: Homeland Infrastructure Foundation-Level Data (HIFLD) Registry`;

  const handleCopy = () => {
    navigator.clipboard.writeText(filingDocumentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([filingDocumentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FERC_Order_1920_Joint_Regional_Filing_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg">⚖️</span>
            <div>
              <h2 className="text-white font-bold text-sm">
                FERC Order No. 1920 Joint Transmission Filing
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Multi-Utility Compliance & Cost-Allocation Brief
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {/* Monospaced Document Preview */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed space-y-3 whitespace-pre-wrap select-text border-y border-slate-800/60">
          {filingDocumentText}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="text-[11px] text-slate-400">
            Estimated Regional Savings:{' '}
            <b className="text-emerald-400 font-mono">${totalSavings.toLocaleString()} USD</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? '✓ Copied to Clipboard' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg border border-emerald-400 shadow transition-colors flex items-center gap-1.5"
            >
              <span>⬇</span>
              <span>Download Formal Filing (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}