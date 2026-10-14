import React from 'react';
import { VentureData } from '../types';
import { Card, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Compass, TrendingUp, ShieldCheck } from 'lucide-react';

interface WhyChooseSectionProps {
  venture: VentureData;
}

export default function WhyChooseSection({ venture }: WhyChooseSectionProps) {
  const pillars = Array.isArray(venture.whyChoosePoints) && venture.whyChoosePoints.length > 0
    ? venture.whyChoosePoints
    : [
        {
          tag: 'Strategic Nexus',
          title: 'Prime Growth Corridor',
          description: 'Positioned signal-free along major expressways, placing employment hubs and rapid transit corridors within easy access.',
          icon: 'Compass',
        },
        {
          tag: 'Capital Appreciation',
          title: 'High-Yield Investment Potential',
          description: 'Surrounded by rapidly developing commercial and residential infrastructure, driving consistent long-term land appreciation.',
          icon: 'TrendingUp',
        },
        {
          tag: 'Legal Integrity',
          title: '100% Clear Title & Spot Registry',
          description: 'Complete statutory and legal certainty with approved layout certification, verified freehold deeds, and immediate registration.',
          icon: 'ShieldCheck',
        },
      ];

  const getIcon = (tag: string, iconName?: string) => {
    const t = (tag || '').toLowerCase();
    if (t.includes('location') || t.includes('nexus') || iconName === 'Compass') {
      return <Compass className="w-5 h-5 text-emerald-600" />;
    }
    if (t.includes('appreciation') || t.includes('growth') || iconName === 'TrendingUp') {
      return <TrendingUp className="w-5 h-5 text-sky-600" />;
    }
    return <ShieldCheck className="w-5 h-5 text-amber-600" />;
  };

  return (
    <section id="why-choose" className="py-20 lg:py-28 bg-[#fafaf9] text-zinc-900 border-b border-zinc-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="outline" className="mb-4 text-xs font-mono tracking-wider uppercase border-emerald-600/30 text-emerald-700 bg-emerald-50">
            {venture.whyChooseEyebrow || 'Strategic Investment Thesis'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
            {venture.whyChooseTitle || 'Engineered for Generational Growth & Title Certainty'}
          </h2>
          {Boolean(venture.whyChooseSubtitle && venture.whyChooseSubtitle.trim()) && (
            <p className="text-base text-zinc-600 mt-4 leading-relaxed font-normal">
              {venture.whyChooseSubtitle}
            </p>
          )}
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => (
            <Card
              key={idx}
              className="bg-white border-zinc-200/90 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(pillar.tag, pillar.icon)}
                  </div>
                  <span className="font-mono text-xs text-zinc-400 font-bold">
                    0{idx + 1}
                  </span>
                </div>

                <div>
                  <Badge variant="secondary" className="mb-2 text-[11px] font-mono bg-zinc-100 text-zinc-700 border-zinc-200">
                    {pillar.tag}
                  </Badge>
                  <CardTitle className="text-xl font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    {pillar.title}
                  </CardTitle>
                </div>

                <CardDescription className="text-zinc-600 text-sm leading-relaxed font-normal">
                  {pillar.description}
                </CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
