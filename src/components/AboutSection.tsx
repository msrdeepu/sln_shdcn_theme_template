import React from 'react';
import { VentureData } from '../types';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, Quote, Award } from 'lucide-react';

interface AboutSectionProps {
  venture: VentureData;
}

export default function AboutSection({ venture }: AboutSectionProps) {
  const checklist = Array.isArray(venture.aboutChecklist) && venture.aboutChecklist.length > 0
    ? venture.aboutChecklist
    : [
        '100% Freehold Statutory Clear Title with immediate spot registration',
        'Direct frontage onto primary 6-lane national transit artery',
        'Concealed electrical lines and storm-water drainage architecture',
        'Pre-approved mortgage sanctioning with top-tier commercial banks',
        'Vaastu-compliant layout orientations tailored for natural ventilation',
      ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white border-b border-zinc-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Architectural Story (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="outline" className="text-xs font-mono tracking-wider uppercase border-emerald-600/30 text-emerald-700 bg-emerald-50">
              {venture.aboutEyebrow || 'Development Architecture'}
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
              {venture.aboutTitle || 'Master-Planned Enclave Conceived for Modern Living'}
            </h2>

            <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
              {venture.overviewText.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Executive Quote Card */}
            {venture.aboutQuote && (
              <Card className="bg-zinc-50 border-l-4 border-l-emerald-600 border-zinc-200/90 shadow-sm">
                <CardContent className="p-5 flex items-start gap-4">
                  <Quote className="w-8 h-8 text-emerald-600 shrink-0 opacity-80 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800 italic leading-relaxed">
                      {venture.aboutQuote}
                    </p>
                    {venture.aboutQuoteAuthor && (
                      <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-wider font-semibold">
                        {venture.aboutQuoteAuthor}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verified Checklist */}
            <div className="pt-4 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                Development Hallmarks
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Visual (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-xl group">
              <img
                src={venture.aboutImage}
                alt={venture.title}
                className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-zinc-200 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold block">
                      Certified Master Layout
                    </span>
                    <span className="text-sm font-bold text-zinc-900 block mt-0.5">
                      {venture.title} • {venture.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
