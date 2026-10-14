import React, { useState } from 'react';
import { Download, CheckCircle, Loader2, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VentureData } from '../types';
import { getLocationAssetUrl } from '../siteConfig';

interface BrochureBannerProps {
  venture: VentureData;
}

export default function BrochureBanner({ venture }: BrochureBannerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const title = (venture.brochureTitle || 'Farmland Near Hyderabad With Easy Access')
    .replace(/\bDTCP\s*(&\s*)?/gi, '')
    .trim();

  const desc = (
    venture.brochureDesc ||
    'Sahaja Nature Lake is at Aroor, Sadashivpet, approximately 5 km off Mumbai Highway.'
  )
    .replace(/\bDTCP\s*(&\s*)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const cardTitle = venture.brochureCardTitle || 'PROJECT LOCATION';
  const btnText = venture.brochureBtnText || 'Get Route & Site Visit Details';

  // Dynamic label-value pairs editable from backend
  const items = Array.isArray(venture.brochureItems) && venture.brochureItems.length > 0
    ? venture.brochureItems
    : [
        { label: 'Project', value: venture.title || 'Sahaja Nature Lake' },
        { label: 'Location', value: venture.location || 'Aroor, Sadashivpet' },
        { label: 'Highway', value: '5 km off Mumbai Highway' },
        { label: 'Road', value: 'Mominpet–Budhera Road' },
      ];

  const getResolvedPdfUrl = (): string => {
    const rawUrl = venture.brochureUrl;
    if (rawUrl && rawUrl !== '#' && rawUrl !== '#download-brochure') {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return rawUrl;
      }
      return getLocationAssetUrl(rawUrl);
    }
    return 'https://cms.slnmplapp.com/core/public/uploads/venture_pages/brochure/sln-arjun-ventures_1790316373_IuAvac.pdf';
  };

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const pdfUrl = getResolvedPdfUrl();
      const fileName = venture.brochureFileName || `${venture.slug || 'venture'}-brochure.pdf`;

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('[BrochureBanner] Download error:', err);
      const fallbackUrl = 'https://cms.slnmplapp.com/core/public/uploads/venture_pages/brochure/sln-arjun-ventures_1790316373_IuAvac.pdf';
      window.open(fallbackUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const brochureImage =
    venture.brochureMockup ||
    venture.heroBanner ||
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

  return (
    <section
      id="brochure"
      className="py-12 sm:py-14 md:py-16 bg-[#FAF8F5] border-b border-zinc-200/90 text-zinc-900 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================== COMPACT TOP HEADER ===================== */}
        <div className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-[2.05rem] font-serif font-black tracking-tight text-[#132a21] leading-tight mb-2">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#556960] font-normal leading-relaxed max-w-2xl mx-auto">
            {desc}
          </p>
        </div>

        {/* ===================== 2-COLUMN GRID ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch md:max-h-[410px]">
          {/* LEFT: Specification / Location Floating Card (5.5 cols) */}
          <div className="md:col-span-6 lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-[#132a21]">
                  {cardTitle}
                </h3>
              </div>

              <div className="space-y-2.5 divide-y divide-zinc-100">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-2.5 text-xs sm:text-sm">
                    <span className="font-semibold text-zinc-500">{item.label}</span>
                    <span className="font-extrabold text-[#132a21] text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-[#133e2b] hover:bg-[#0d2a1d] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{btnText}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Project Landscape / Blueprint Preview Graphic (6.5 cols, max-h 410px, object-contain) */}
          <div
            onClick={handleDownload}
            className="md:col-span-6 lg:col-span-7 relative rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm h-[260px] sm:h-[320px] md:h-full md:max-h-[410px] flex items-center justify-center p-3 cursor-pointer group"
            title="Click to download official brochure"
          >
            <img
              src={brochureImage}
              alt={`${venture.title} Official Brochure & Location`}
              className="w-full h-full object-contain block group-hover:scale-[1.02] transition-transform duration-300 select-none"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
