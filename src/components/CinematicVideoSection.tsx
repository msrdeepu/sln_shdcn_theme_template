import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Compass,
  Sparkles,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { VentureData } from '../types';

interface CinematicVideoSectionProps {
  venture: VentureData;
}

export default function CinematicVideoSection({ venture }: CinematicVideoSectionProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Extract clean Vimeo Video ID strictly from CMS API
  const rawVimeoId = venture.vimeoId || venture.vimeoUrl;
  const cleanVimeoId = (() => {
    if (!rawVimeoId) return null;
    const raw = String(rawVimeoId).trim();
    if (!raw) return null;
    const match = raw.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)?([0-9a-zA-Z_-]+)/);
    return match ? match[1] : raw;
  })();

  const vimeoBgEmbedUrl = cleanVimeoId
    ? `https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&loop=1&background=1&muted=${isMuted ? 1 : 0}&autopause=0&quality=1080p`
    : '';
  const vimeoFullscreenUrl = cleanVimeoId
    ? `https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0`
    : '';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && videoOpen) {
        handleCloseFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      const isDocFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isDocFs && videoOpen) {
        setVideoOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoOpen]);

  const scrollToMasterPlan = () => {
    const el = document.getElementById('master-plan');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If there is no video ID, hide this entire section completely
  if (!cleanVimeoId) {
    return null;
  }

  return (
    <section
      id="cinematic-tour"
      className="relative py-20 lg:py-28 w-full bg-slate-950 text-white overflow-hidden antialiased"
    >
      {/* Background Architectural Ambient Glow & Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-3xl -z-10" />
        <div
          className="absolute inset-0 opacity-[0.04] -z-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
              {venture.droneVideoTitle || 'Cinematic Master Tour From Above'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {venture.droneVideoSubtitle || venture.droneVideoDesc || "Experience an ultra-high-definition bird's-eye perspective capturing the sweeping 40 & 50 ft blacktop avenues, verdant open green lungs, and strategic growth corridor connectivity."}
            </p>
          </div>

          {/* Quick Stats & Audio Controls */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-medium text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenFullscreen}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>

        {/* Modern Curved Architectural Cinema Bezel Player */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/20 bg-slate-900 shadow-2xl group">
          
          {/* 16:9 Video Canvas without dark overlays or text on video */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
            {/* Fallback Banner */}
            {venture.heroBanner && (
              <img
                src={venture.heroBanner}
                alt={venture.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            )}

            {/* Seamless Vimeo Loop in Full Daylight Clarity */}
            <iframe
              src={vimeoBgEmbedUrl}
              title="Venture Cinematic Drone Overview"
              className="w-[100vw] h-[56.25vw] min-h-[100%] min-w-[177.77%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 pointer-events-none opacity-100"
              allow="autoplay; fullscreen"
            />

            {/* Center Play Button Overlay */}
            <div
              onClick={handleOpenFullscreen}
              className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/10 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenFullscreen();
              }}
              title="Click to launch high-resolution fullscreen theater"
            >
              <div className="w-20 h-20 rounded-full bg-white/95 hover:bg-white text-slate-950 flex items-center justify-center shadow-2xl shadow-black/80 group-hover:scale-115 transition-all duration-300">
                <Play className="h-8 w-8 fill-current translate-x-0.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4K CINEMATIC IMMERSIVE THEATER MODAL                                       */}
      {/* ========================================================================= */}
      {videoOpen && (
        <div
          ref={fullscreenContainerRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] w-screen h-screen bg-black flex flex-col animate-in fade-in duration-200"
        >
          {/* Top Control Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <div className="text-white">
                <h3 className="text-sm sm:text-base font-bold leading-tight">
                  {venture.droneVideoTitle || `${venture.title} — 4K Aerial Drone Walkthrough`}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Full Cinema Projection • 1080p 60fps Stream
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseFullscreen}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Theater (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Centered High-Res Video Player */}
          <div className="relative w-full h-full flex items-center justify-center p-0 sm:p-6 lg:p-12">
            <iframe
              src={vimeoFullscreenUrl}
              title="Venture 4K Cinematic Aerial Tour"
              className="w-full h-full max-w-7xl max-h-[85vh] rounded-none sm:rounded-2xl border-0 shadow-2xl"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Bottom Theater Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-30 px-6 py-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono text-[11px]">Press Esc or click ✕ to return to site</span>
            <button
              type="button"
              onClick={() => {
                handleCloseFullscreen();
                const contactEl = document.getElementById('contact');
                if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition-all cursor-pointer shadow-lg"
            >
              Enquire About This Project
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
