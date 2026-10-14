import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Box as BoxIcon,
  Calendar,
  ArrowRight,
  Maximize2,
  X,
} from 'lucide-react';
import type { VentureData } from '../types';
import { micrositeService } from '../services/micrositeService';
import { SITE_CONFIG } from '../siteConfig';

interface HeroSectionProps {
  venture: VentureData;
}

export default function HeroSection({ venture }: HeroSectionProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [plotStats, setPlotStats] = useState<{ total: number | null; available: number | null }>({
    total: venture.totalPlotsCount ?? null,
    available: venture.availablePlotsCount ?? null,
  });

  // Query live properties from Property model for this venture (Total Plots & Available Plots)
  useEffect(() => {
    const vId = venture.ventureId || (venture as any).venture_id || SITE_CONFIG.activeVentureId;
    if (vId) {
      micrositeService.fetchPropertyStats(vId).then((res) => {
        if (res) {
          setPlotStats({
            total: res.total_plots,
            available: res.available_plots,
          });
        }
      });
    }
  }, [venture.ventureId]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const heroImageSrc = venture.heroBanner;

  // Use custom background cover image if uploaded in admin, fallback to site photo or hero banner
  const bgCoverImage =
    venture.heroBgImage ||
    venture.aboutImage ||
    venture.heroBanner ||
    '';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] lg:min-h-screen w-full pt-28 lg:pt-32 pb-16 lg:pb-20 flex flex-col justify-center overflow-hidden antialiased text-zinc-900 bg-[#faf9f5]"
    >
      {/* ========================================================================= */}
      {/* BIG COVER IMAGE IN BACKGROUND (DAY THEME WITH SUNLIT LUXURY OVERLAYS)     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {bgCoverImage && (
          <img
            src={bgCoverImage}
            alt={`${venture.title} Cover Background`}
            className="w-full h-full object-cover object-center scale-102 filter brightness-[0.98] contrast-[1.02]"
            loading="eager"
          />
        )}

        {/* Multi-angle sunlit day gradient overlays: daylight vibrancy with flawless readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f5]/96 via-[#faf9f5]/88 to-[#faf9f5]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f5] via-transparent to-[#faf9f5]/60" />

        {/* Ambient atmospheric day glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/35 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl" />

        {/* Subtle architectural precision dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ========================================================================= */}
          {/* LEFT COLUMN: Venture Title, Location, Narrative, 3 Specs, Two CTAs (7 Cols)*/}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-7">

            {/* Monumental Venture Title */}
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.05] text-zinc-950 text-balance">
                {venture.title}
              </h1>
            </div>

            {/* Narrative & Location Pill */}
            <div className="space-y-3.5 max-w-2xl">
              {(venture.subheadline ||
                venture.tagline ||
                (venture.headline && venture.headline !== venture.title ? venture.headline : '')) && (
                <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
                  {venture.subheadline || venture.tagline || venture.headline}
                </p>
              )}

              {venture.location && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-800 bg-white/90 backdrop-blur-md border border-zinc-200/90 w-fit px-3.5 py-1.5 rounded-xl shadow-xs">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{venture.location}</span>
                </div>
              )}
            </div>

            {/* Dynamic Metric Specs: 3 Cards */}
            {(() => {
              // 1. Total Acres (Manual Entry from admin specs)
              const acresSpec = Array.isArray(venture.specs)
                ? venture.specs.find((s) => /acre/i.test(s.label || '')) || venture.specs[0]
                : null;
              const acresVal = acresSpec?.value || '10';
              const acresLabel = acresSpec?.label && /acre/i.test(acresSpec.label) ? acresSpec.label.toUpperCase() : 'TOTAL ACRES';
              const acresSub = acresSpec?.sub || 'DTCP & RERA Approved';

              // 2. Total Plots (From Property model query)
              const plotsSpec = Array.isArray(venture.specs)
                ? venture.specs.find((s) => /plot/i.test(s.label || ''))
                : null;
              const totalPlotsVal =
                plotStats.total != null && plotStats.total > 0
                  ? String(plotStats.total)
                  : venture.totalPlotsCount != null && venture.totalPlotsCount > 0
                  ? String(venture.totalPlotsCount)
                  : venture.totalPlots || plotsSpec?.value || '131';
              const totalPlotsLabel = 'TOTAL PLOTS';
              const totalPlotsSub = plotsSpec?.sub || 'Engineered for Heavy Traffic';

              // 3. Available Plots (From Property model where status == 'Available')
              const availablePlotsVal =
                plotStats.available != null
                  ? String(plotStats.available)
                  : venture.availablePlotsCount != null
                  ? String(venture.availablePlotsCount)
                  : '128';
              const availablePlotsLabel = 'AVAILABLE PLOTS';
              const availablePlotsSub = 'East & North Facing Alignments';

              const cards = [
                { label: acresLabel, value: acresVal, sub: acresSub },
                { label: totalPlotsLabel, value: totalPlotsVal, sub: totalPlotsSub },
                { label: availablePlotsLabel, value: availablePlotsVal, sub: availablePlotsSub },
              ];

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl pt-1">
                  {cards.map((spec, idx) => (
                    <div
                      key={idx}
                      className="bg-white/92 hover:bg-white backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-zinc-200/90 shadow-xs hover:shadow-md transition-all"
                    >
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 truncate">
                        {spec.label}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 block truncate">
                        {spec.value}
                      </span>
                      {spec.sub && (
                        <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block truncate">
                          {spec.sub}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Action Row: Two CTAs */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-4 pt-2 w-full">
              {/* CTA 1: Explore 3D Master Plan */}
              <button
                type="button"
                onClick={() => scrollToSection('master-plan')}
                className="w-full sm:w-auto px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-sans font-extrabold text-[11.5px] sm:text-xs md:text-sm tracking-wide uppercase shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 group text-center"
              >
                <BoxIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="sm:hidden">Explore 3D Plan</span>
                <span className="hidden sm:inline">Explore 3D Master Plan</span>
                <ArrowRight className="h-4 w-4 shrink-0 hidden md:inline transition-transform group-hover:translate-x-1" />
              </button>

              {/* CTA 2: Schedule Site Visit */}
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto px-4 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-[11.5px] sm:text-xs md:text-sm border border-zinc-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-center"
              >
                <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="sm:hidden">Site Visit</span>
                <span className="hidden sm:inline">Schedule Site Visit</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Striking Visual Showcase Banner (5 Cols, 535x690)           */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Ambient Backlight */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-amber-400/20 rounded-[34px] blur-2xl opacity-80 -z-10" />

            {/* The High-Precision Showcase Frame (535x690) */}
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white border border-zinc-200/90 shadow-2xl aspect-[535/690] w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px] xl:max-w-[535px] max-h-[690px] group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1"
              title="Click to view full screen"
            >
              {heroImageSrc ? (
                <img
                  src={heroImageSrc}
                  alt={`${venture.title} Striking Visual Showcase`}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out select-none"
                  loading="eager"
                  width={535}
                  height={690}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-400 gap-2">
                  <Maximize2 className="w-12 h-12 text-zinc-400" />
                  <span className="text-xs font-mono">Official Showcase (535 × 690)</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* High-Resolution Master Showcase Lightbox Modal */}
      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Header Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Maximize2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-serif text-white tracking-wide">
                  {venture.title} — Official Showcase
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                  High-Resolution Master Showcase Preview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-View Image Container */}
          <div
            className="relative w-full max-w-5xl max-h-[80vh] my-auto flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/60 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {heroImageSrc && (
              <img
                src={heroImageSrc}
                alt={`${venture.title} High Resolution Preview`}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>

          <p className="text-[11px] font-mono text-zinc-400 mt-2">
            Click anywhere outside or press Esc to return
          </p>
        </div>
      )}
    </section>
  );
}
