import React, { useState } from 'react';
import { VentureData } from '../types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface BrochureBannerProps {
  venture: VentureData;
}

export default function BrochureBanner({ venture }: BrochureBannerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const title = (venture.brochureTitle || 'Download Official Venture Brochure & Master Layout Plan')
    .replace(/\bDTCP\s*(&\s*)?/gi, '')
    .trim();

  const desc = (
    venture.brochureDesc ||
    'Receive the verified layout plan, approval certificates, infrastructure blueprints, and plot price schedule.'
  )
    .replace(/\bDTCP\s*(&\s*)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const rawUrl = venture.brochureUrl;
    const pdfUrl = rawUrl && rawUrl !== '#' && rawUrl !== '#download-brochure'
      ? (rawUrl.startsWith('http') ? rawUrl : `https://cms.slnmplapp.com/core/public/${rawUrl.replace(/^\/+/, '')}`)
      : 'https://cms.slnmplapp.com/core/public/uploads/venture_pages/brochure/sln-arjun-ventures_1790316373_IuAvac.pdf';

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = venture.brochureFileName || `${venture.title || 'SLN_Venture'}_Brochure.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      setIsDownloading(false);
    }, 1000);
  };

  const brochureImage = venture.brochureMockup || venture.heroBanner;

  return (
    <section id="brochure" className="py-20 lg:py-28 bg-[#fafbfc] border-b border-zinc-200/80 text-zinc-900 relative overflow-hidden">
      {/* Dreamy Luminous Mesh Gradient Aura (Reference Design Style) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-[550px] h-[550px] bg-gradient-to-br from-emerald-200/35 via-teal-100/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-amber-200/25 via-orange-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-blue-200/20 via-indigo-50/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Layered Floating Showcase Image Stage (6 Cols)               */}
          {/* Matches the composition in the reference image (left image, right text)   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 relative">
            {/* Layer 1 (Back Card): Shifted Mint/Teal Translucent Aura Card */}
            <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 w-full h-full rounded-[36px] bg-gradient-to-tr from-emerald-400/25 to-teal-300/35 -z-10 shadow-lg border border-emerald-300/30" />

            {/* Layer 2 (Main Foreground Card): Tall Elevated Showcase */}
            <div
              onClick={handleDownload}
              className="relative rounded-[32px] overflow-hidden bg-white shadow-2xl border border-white/80 h-[400px] sm:h-[480px] lg:h-[520px] w-full group cursor-pointer"
              title="Click to download brochure"
            >
              {brochureImage ? (
                <img
                  src={brochureImage}
                  alt={`${venture.title} Official Brochure`}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out select-none"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 font-mono text-sm">
                  Official Brochure Preview
                </div>
              )}

              {/* Floating verified badge in bottom corner */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Official Layout PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Editorial Story, Highlight & Action CTA (6 Cols)            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow with mint accent bar */}
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 block">
                OFFICIAL PROJECT BROCHURE
              </span>
              <div className="w-12 h-0.5 bg-emerald-500 mt-1 rounded-full" />
            </div>

            {/* Monumental Headline */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-[1.12] text-balance">
                {title}
              </h2>
            </div>

            {/* Narrative Description */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-xl text-pretty">
              {desc}
            </p>

            {/* Direct Download Button (Matches Housy blue/emerald pill button) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md gap-2 transition-all hover:scale-102 cursor-pointer"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download Brochure'}</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
