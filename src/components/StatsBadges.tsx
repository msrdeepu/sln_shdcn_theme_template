import React from 'react';
import { VentureData } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles } from 'lucide-react';

interface StatsBadgesProps {
  venture: VentureData;
}

export default function StatsBadges({ venture }: StatsBadgesProps) {
  const specs = Array.isArray(venture.specs) && venture.specs.length > 0
    ? venture.specs
    : [
        { value: '180+', label: 'Villa Plots', sub: 'Approved Layout' },
        { value: '40 & 50 Ft', label: 'Internal Blacktop Avenues', sub: 'Engineered for Heavy Traffic' },
        { value: '100%', label: 'Vaastu Orientation', sub: 'East & North Facing Alignments' },
        { value: '24/7', label: 'Guarded Gated Perimeter', sub: 'Full Masonry Compound Wall' },
        { value: 'Instant', label: 'Spot Registration', sub: 'Ready for Immediate Possession' },
      ];

  return (
    <section id="stats-strip" className="py-10 bg-white border-b border-zinc-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-semibold">
              Verified Layout Specifications
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-zinc-300 bg-zinc-50 text-zinc-600">
            {venture.title} Key Parameters
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {specs.map((item, idx) => (
            <Card
              key={idx}
              className="bg-[#fafaf9] border-zinc-200 hover:border-emerald-500/50 hover:bg-white hover:shadow-md transition-all duration-300 group"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-400 font-bold">
                    0{idx + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-600 transition-colors" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-mono group-hover:text-emerald-700 transition-colors">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-800 mt-1">
                    {item.label}
                  </div>
                  {item.sub && (
                    <div className="text-[11px] text-zinc-500 font-normal mt-0.5 line-clamp-1">
                      {item.sub}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
