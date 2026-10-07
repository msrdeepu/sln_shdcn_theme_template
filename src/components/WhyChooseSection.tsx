import React from 'react';
import { VentureData } from '../types';
import { Card, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Compass, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';

interface WhyChooseSectionProps {
  venture: VentureData;
}

export default function WhyChooseSection({ venture }: WhyChooseSectionProps) {
  const pillars = Array.isArray(venture.whyChoosePoints) && venture.whyChoosePoints.length > 0
    ? venture.whyChoosePoints
    : [
        {
          tag: 'Strategic Nexus',
          title: 'Tada-Sri City Growth Gateway',
          description: 'Positioned signal-free along the NH-16 arterial expressway, placing Fortune-500 industrial hubs and express transit within minutes.',
          points: [
            '5 Mins to Tada Railway Junction',
            'Direct signal-free 6-lane artery to North Chennai',
            'Adjacent to international industrial logistics corridor'
          ],
          icon: 'Compass'
        },
        {
          tag: 'Capital Appreciation',
          title: 'High-Yield Industrial Synergy',
          description: 'Flanked by Sri City SEZ housing 220+ global conglomerates with over 65,000 corporate professionals driving relentless land appreciation.',
          points: [
            'Demonstrated 18–24% historic annual land appreciation',
            'Expanding educational campuses & tertiary healthcare hubs',
            'Sustained corporate housing rental demand'
          ],
          icon: 'TrendingUp'
        },
        {
          tag: 'Legal Integrity',
          title: '100% Clear Title & Spot Registry',
          description: 'Complete statutory and legal certainty with sanctioned layout certification, verified titles, and pre-approved national bank loans.',
          points: [
            'Immediate spot registration upon plot allocation',
            'Pre-approved mortgage assistance: SBI, HDFC, ICICI',
            'Unencumbered freehold ownership deed'
          ],
          icon: 'ShieldCheck'
        }
      ];

  const getIcon = (tag: string, iconName?: string) => {
    if (tag.toLowerCase().includes('location') || tag.toLowerCase().includes('nexus') || iconName === 'Compass') {
      return <Compass className="w-5 h-5 text-emerald-600" />;
    }
    if (tag.toLowerCase().includes('appreciation') || tag.toLowerCase().includes('growth') || iconName === 'TrendingUp') {
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
          {venture.whyChooseSubtitle && (
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

                {pillar.points && pillar.points.length > 0 && (
                  <div className="pt-3.5 border-t border-zinc-100 space-y-2">
                    {pillar.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
