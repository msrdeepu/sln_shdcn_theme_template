import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import type { VentureData, DevelopmentHighlightItem } from '../types';

interface DevelopmentHighlightsSectionProps {
  venture: VentureData;
}

export default function DevelopmentHighlightsSection({
  venture,
}: DevelopmentHighlightsSectionProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<DevelopmentHighlightItem | null>(null);

  const config = venture.developmentHighlights;
  const highlights = config?.items || [];

  // Strictly only render if there are items from backend. Never render fallback data.
  if (!config || highlights.length === 0) {
    return null;
  }

  return (
    <section
      id="development-highlights"
      className="py-16 md:py-24 bg-[#FAF9F5] text-slate-900 relative overflow-hidden border-t border-b border-slate-200/80"
    >
      {/* Daylight Atmospheric Ambient Glows & Dot Grid */}
      <div
        className="absolute -top-24 right-[5%] w-[550px] h-[550px] rounded-full pointer-events-none blur-[50px]"
        style={{
          background: 'radial-gradient(circle, rgba(217, 180, 126, 0.12) 0%, rgba(250, 249, 245, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-28 left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[60px]"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.07) 0%, rgba(250, 249, 245, 0) 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Rendered ONLY if title is provided from backend */}
        {Boolean(config.title && config.title.trim()) && (
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 leading-tight">
              {config.title}
            </h2>
            {Boolean(config.subtitle && config.subtitle.trim()) && (
              <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal leading-relaxed">
                {config.subtitle}
              </p>
            )}
          </div>
        )}

        {/* 3-Items per Row Gallery Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-7 ${
            highlights.length < 3 ? 'justify-center' : ''
          }`}
        >
          {highlights.map((item, idx) => {
            const hasImage = Boolean(item.image && item.image.trim());
            const imgSrc = hasImage ? item.image : '';

            return (
              <div
                key={item.id || idx}
                onClick={() => setSelectedHighlight(item)}
                className="group flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Image Container with Exact Same Proportions as Theme 3: 200px - 220px height, object-cover */}
                {hasImage && (
                  <div className="relative h-[200px] sm:h-[215px] md:h-[220px] overflow-hidden bg-slate-100">
                    <img
                      src={imgSrc}
                      alt={item.title || 'Highlight'}
                      onError={(e: any) => {
                        const target = e.currentTarget;
                        if (target) target.style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Subtle vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />

                    {/* Zoom Icon Button in Corner */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-900 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
                      <ZoomIn className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    {item.title && (
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>
                    )}
                    {(item.description || item.desc) && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description || item.desc}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform pt-1">
                    <span>View Full Details →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Lightbox Preview Dialog */}
      {selectedHighlight && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedHighlight(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedHighlight(null)}
              className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            {selectedHighlight.image && (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                <img
                  src={selectedHighlight.image}
                  alt={selectedHighlight.title || 'Highlight Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-tight">
                {selectedHighlight.title}
              </h3>
              {(selectedHighlight.description || selectedHighlight.desc) && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {selectedHighlight.description || selectedHighlight.desc}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
