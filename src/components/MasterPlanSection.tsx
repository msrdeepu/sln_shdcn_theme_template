import React from 'react';
import { VentureData } from '../types';
import { Badge } from './ui/badge';
import InteractiveMasterPlan from './InteractiveMasterPlan';

interface MasterPlanSectionProps {
  venture: VentureData;
}

export default function MasterPlanSection({ venture }: MasterPlanSectionProps) {
  const cleanTitle = (venture.masterPlanTitle || 'Approved Layout & Plot Architecture')
    .replace(/\bDTCP\s*(&\s*)?/gi, '')
    .trim();

  return (
    <section id="master-plan" className="py-20 lg:py-28 bg-white border-b border-zinc-200/90 text-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-4 text-xs font-mono uppercase tracking-wider border-emerald-600/30 text-emerald-700 bg-emerald-50">
            {venture.masterPlanEyebrow || 'Master Layout Plan'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
            {cleanTitle}
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base mt-2 max-w-2xl font-normal">
            Explore the real-time interactive master plan. Pan, zoom, inspect individual plot dimensions, facing, and status in real-time.
          </p>
        </div>

        {/* Live Interactive Master Plan (3D Drone Tour, 2D Cadastral, Multi-Plot Compare & Real-time Plot Status) */}
        <InteractiveMasterPlan venture={venture} />
      </div>
    </section>
  );
}
