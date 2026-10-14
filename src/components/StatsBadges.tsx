import React, { useState, useRef } from 'react';
import { VentureData } from '../types';

interface StatsBadgesProps {
  venture: VentureData;
}

interface SpecCardProps {
  item: { value: string; label: string; sub?: string };
  idx: number;
}

function Interactive3DCard({ item, idx }: SpecCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsTapped(false);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  // Curated color themes matching Theme 3
  const getCardTheme = () => {
    const l = (item.label || '').toLowerCase();
    if (l.includes('acre') || l.includes('land') || l.includes('area')) {
      return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' };
    }
    if (l.includes('plot') || l.includes('unit') || l.includes('villa')) {
      return { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)' };
    }
    if (l.includes('sft') || l.includes('feet') || l.includes('sq') || l.includes('size')) {
      return { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.25)' };
    }
    if (l.includes('tree') || l.includes('green') || l.includes('nature') || l.includes('park')) {
      return { color: '#059669', glow: 'rgba(5, 150, 105, 0.25)' };
    }
    if (l.includes('block') || l.includes('sector') || l.includes('road') || l.includes('avenue')) {
      return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' };
    }
    const fallbacks = [
      { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
      { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)' },
      { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.25)' },
      { color: '#059669', glow: 'rgba(5, 150, 105, 0.25)' },
      { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' },
    ];
    return fallbacks[idx % fallbacks.length];
  };

  const { color: accentColor, glow: cardGlow } = getCardTheme();
  const isFlipped = isHovered || isTapped;

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsTapped((prev) => !prev)}
      className="h-[195px] sm:h-[210px] md:h-[220px] cursor-pointer select-none"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ===================== FRONT FACE (NUMBER & TITLE) ===================== */}
        <div
          className="absolute inset-0 p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/90 flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-300 hover:shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: `0 14px 30px -10px ${cardGlow}, 0 4px 12px -2px rgba(15, 23, 42, 0.05)`,
            borderColor: isHovered ? accentColor : undefined,
          }}
        >
          {/* Dynamic Glare Reflection */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 65%)`,
              opacity: glare.opacity,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Monumental 3D Number & Title */}
          <div className="relative z-10 px-1 max-w-full">
            <h3
              className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 mb-2 leading-none"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
            >
              {item.value}
            </h3>
            <p className="font-extrabold text-slate-700 text-xs sm:text-sm md:text-base capitalize tracking-tight leading-tight">
              {item.label}
            </p>
          </div>

          {/* Bottom subtle accent bar */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
            <div
              className="w-6 h-1 rounded-full"
              style={{ backgroundColor: `${accentColor}50` }}
            />
          </div>
        </div>

        {/* ===================== BACK FACE (DESCRIPTION ONLY) ===================== */}
        <div
          className="absolute inset-0 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border flex flex-col justify-center items-center text-center text-white overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: `${accentColor}80`,
            boxShadow: `0 18px 36px -10px ${cardGlow}, 0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-[30%] -right-[30%] w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
            }}
          />

          {/* Description Only */}
          <div className="relative z-10 px-2 max-w-full">
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
              {item.sub || 'Official Layout Certified Specification'}
            </p>
          </div>

          {/* Bottom subtle accent bar on back */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
            <div
              className="w-6 h-1 rounded-full"
              style={{ backgroundColor: `${accentColor}60` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
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

  const sectionTitle = venture.specsTitle || venture.specsEyebrow || 'Venture Snapshot';

  return (
    <section
      id="stats-strip"
      className="py-14 sm:py-16 md:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/90 relative overflow-hidden"
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
            linear-gradient(rgba(226, 232, 240, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226, 232, 240, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 leading-tight">
            {sectionTitle}
          </h2>
          {Boolean(venture.specsSubtitle && venture.specsSubtitle.trim()) && (
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed font-normal">
              {venture.specsSubtitle}
            </p>
          )}
        </div>

        {/* 5-Column Responsive Tilting Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {specs.map((item, idx) => (
            <Interactive3DCard key={idx} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
