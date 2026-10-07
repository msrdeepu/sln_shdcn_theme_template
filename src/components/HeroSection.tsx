import React, { useState, useEffect, useRef } from 'react';
import { VentureData } from '../types';
import { Button } from './ui/button';
import {
  Calendar,
  ChevronDown,
  Tv,
  X,
  Maximize2,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
  Search,
  Phone
} from 'lucide-react';

interface HeroSectionProps {
  venture: VentureData;
}

export default function HeroSection({ venture }: HeroSectionProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Extract Vimeo Video ID strictly from CMS API
  const rawVimeoId = (venture.vimeoId || venture.vimeoUrl || '').trim();
  const cleanVimeoId = (() => {
    if (!rawVimeoId) return '';
    const match = rawVimeoId.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)?([0-9a-zA-Z_-]+)/);
    return match ? match[1] : rawVimeoId;
  })();

  const hasVideo = Boolean(cleanVimeoId);

  // Vimeo URLs
  const vimeoBgEmbedUrl = hasVideo
    ? `https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&loop=1&background=1&muted=1&autopause=0&quality=1080p`
    : '';
  const vimeoFullscreenUrl = hasVideo
    ? `https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0`
    : '';

  const scrollToContent = () => {
    const el = document.getElementById('stats-strip') || document.getElementById('why-choose');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Fullscreen Enter for Video
  const handleOpenFullscreen = () => {
    setVideoOpen(true);
    setTimeout(() => {
      const el = fullscreenContainerRef.current || document.documentElement;
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any)?.webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    }, 100);
  };

  // Handle Fullscreen Exit for Video
  const handleCloseFullscreen = () => {
    setVideoOpen(false);
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Handle Full Page Edge-to-Edge Viewer for Image (Zero Boxed Modal)
  const handleOpenImageFullscreen = () => {
    setIsImageFullscreen(true);
    setTimeout(() => {
      const el = document.documentElement;
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any)?.webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    }, 100);
  };

  const handleCloseImageFullscreen = () => {
    setIsImageFullscreen(false);
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Listen to Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (videoOpen) handleCloseFullscreen();
        if (isImageFullscreen) handleCloseImageFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoOpen, isImageFullscreen]);

  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);

  // =========================================================================
  // SCENARIO A: 100vh FULL CINEMATIC VIMEO BACKGROUND VIDEO (When video exists)
  // =========================================================================
  if (hasVideo) {
    return (
      <section
        id="hero"
        className="relative h-screen min-h-[680px] w-full overflow-hidden flex flex-col justify-end"
      >
        <div className="absolute inset-0 z-0 bg-zinc-900 overflow-hidden pointer-events-none">
          {venture.heroBanner && (
            <img
              src={venture.heroBanner}
              alt={venture.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}

          <iframe
            src={vimeoBgEmbedUrl}
            title="Venture Cinematic Vimeo Hero Video"
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 pointer-events-none"
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Bottom Hero Information Card on Hover */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full pb-4 sm:pb-12 pointer-events-none">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => setIsCardHovered(false)}
              className={`w-full sm:w-auto sm:max-w-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-2xl rounded-2xl p-4 sm:p-8 space-y-2.5 sm:space-y-4 transition-all duration-300 ease-out pointer-events-auto ${
                isCardHovered
                  ? 'opacity-100 translate-y-0 shadow-2xl'
                  : 'opacity-0 translate-y-2 max-sm:opacity-100'
              }`}
            >
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-tight sm:leading-[1.08]">
                {venture.headline || venture.title}
              </h1>

              <p className="text-xs sm:text-base text-zinc-700 font-normal leading-snug sm:leading-relaxed text-balance line-clamp-2 sm:line-clamp-none">
                {venture.subheadline || venture.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-xl cursor-pointer"
                  asChild
                >
                  <a href="#contact">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Book Site Visit</span>
                  </a>
                </Button>

                <button
                  type="button"
                  onClick={handleOpenFullscreen}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span>Play High-Res Vimeo Film</span>
                </button>
              </div>
            </div>

            <button
              onClick={scrollToContent}
              className="hidden sm:flex items-center gap-2 text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider group cursor-pointer self-end pb-2 drop-shadow-md transition-colors"
            >
              <span>Scroll to Explore</span>
              <div className="w-8 h-8 rounded-full border border-white/40 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:border-emerald-400 group-hover:text-emerald-400 shadow-md transition-all">
                <ChevronDown className="w-4 h-4 animate-bounce text-white" />
              </div>
            </button>
          </div>
        </div>

        {videoOpen && (
          <div
            ref={fullscreenContainerRef}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-white font-bold text-sm sm:text-base font-mono">
                  {venture.droneVideoTitle || `${venture.title} — 4K Aerial Walkthrough`}
                </h3>
              </div>
              <button
                onClick={handleCloseFullscreen}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-full relative">
              <iframe
                src={vimeoFullscreenUrl}
                title="Vimeo Fullscreen Video Walkthrough"
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        )}
      </section>
    );
  }

  // =========================================================================
  // SCENARIO B: LUMINOUS AURORA HERO WITH LAYERED CARD SHOWCASE (When no video)
  // Perfectly matching the 'Housy' reference design aesthetic
  // =========================================================================
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] w-full bg-[#fafbfc] pt-24 sm:pt-28 lg:pt-32 pb-10 lg:pb-14 flex flex-col justify-center overflow-hidden antialiased text-zinc-900"
    >
      {/* Luminous Dreamy Mesh Gradient Aura (Housy Style) */}
      {/* Subtle Luminous Ambient Aura (Soft & Warm, No Heavy Blue) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Soft Golden/Amber Aura (Top Left) */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-3xl" />
        
        {/* Gentle Emerald/Teal Glow */}
        <div className="absolute top-10 right-10 w-[550px] h-[550px] bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="relative flex flex-col lg:flex-row items-center justify-center">
          
          {/* ========================================================================= */}
          {/* LEFT: Modern Floating Card (Layered Overlap Depth, Centered Composition)  */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-auto lg:max-w-[520px] xl:max-w-[560px] z-20 lg:-mr-12 xl:-mr-16 relative bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] p-7 sm:p-9 lg:p-11 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-white/90 space-y-5 sm:space-y-6">
            {/* Eyebrow with mint accent bar */}
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 block">
                {venture.welcomeEyebrow || 'PREMIER PLOTTED GATED COMMUNITY'}
              </span>
              <div className="w-10 h-0.5 bg-emerald-500 mt-1.5 rounded-full" />
            </div>

            {/* Monumental Headline with Mint Brush Highlight */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight text-zinc-950 leading-[1.14] text-balance">
                Here to help you find the home of{' '}
                <span className="relative inline-block text-zinc-950 whitespace-nowrap">
                  your dreams
                  <span className="absolute bottom-1 sm:bottom-1.5 left-0 right-0 h-2.5 sm:h-3.5 bg-emerald-300/70 -z-10 rounded-sm" />
                </span>
                .
              </h1>
            </div>

            {/* Subheadline / Narrative Description */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              {venture.subheadline ||
                venture.tagline ||
                `Discover ${venture.title}, a premium residential open-plot venture designed for comfortable living and smart investment, offering well-planned plots and prime connectivity.`}
            </p>

            {/* Action Button: Book Site Visit */}
            <div className="pt-1">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/15 gap-2 transition-all hover:scale-102 cursor-pointer"
                asChild
              >
                <a href="#contact">
                  <Calendar className="w-4 h-4" />
                  <span>Book Site Visit</span>
                </a>
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: High-Precision Portrait Showcase (w: 535px, h: 690px)              */}
          {/* ========================================================================= */}
          <div className="w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] shrink-0 relative z-10 mt-8 lg:mt-0">
            {/* Elegant Portrait Frame Tailored to 535x690 with Soft Ambient Shadow */}
            <div
              onClick={handleOpenImageFullscreen}
              className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14)] hover:shadow-[0_32px_75px_-15px_rgba(0,0,0,0.18)] border border-zinc-200/80 aspect-[535/690] w-full max-h-[640px] xl:max-h-[680px] group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1"
              title="Click to view full screen"
            >
              {venture.heroBanner ? (
                <img
                  src={venture.heroBanner}
                  alt={`${venture.title} Official Showcase`}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out select-none"
                  loading="eager"
                  width={535}
                  height={690}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-mono text-sm bg-zinc-100">
                  Official Showcase Preview (535 × 690)
                </div>
              )}

              {/* Slim Floating Full Screen Trigger Pill in Top Corner (Avoids Contact Info) */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenImageFullscreen();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/75 hover:bg-zinc-950 text-white text-xs font-medium backdrop-blur-md border border-white/15 shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>
          </div>

        </div>



      </div>

      {/* ========================================================================= */}
      {/* TRUE FULL-PAGE / FULLSCREEN IMAGE VIEWER (ZERO BOXED MODAL)               */}
      {/* ========================================================================= */}
      {isImageFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden"
          onClick={handleCloseImageFullscreen}
        >
          {/* Top Floating Controls */}
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-white font-bold text-sm sm:text-base font-mono">
                {venture.title} — Full Screen Showcase
              </h3>
            </div>
            <button
              onClick={handleCloseImageFullscreen}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Edge-to-Edge Image Viewport */}
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-6">
            {venture.heroBanner && (
              <img
                src={venture.heroBanner}
                alt={venture.title}
                className="w-full h-full object-contain select-none"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
