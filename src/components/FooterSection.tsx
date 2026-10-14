import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import type { VentureData, FooterSocialLink, FooterColumn } from '../types';

interface FooterSectionProps {
  venture: VentureData;
}

export default function FooterSection({ venture }: FooterSectionProps) {
  const footer = venture.footer || {};

  // ── 1. COLORS ────────────────────────────────────────────────────────────
  const bgColor = footer.bgColor || '#090d16';
  const cardBgColor = footer.cardBgColor || '#ffffff';
  const accentColor = footer.accentColor || '#059669';
  const textColor = footer.textColor || '#1e293b';
  const bottomTextColor = footer.bottomTextColor || '#94a3b8';

  // ── 2. GOOGLE MAP EMBED ──────────────────────────────────────────────────
  const rawMapUrl =
    footer.mapEmbedUrl ||
    venture.contact?.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31050.15024419996!2d80.005085!3d13.585526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d81232870197d%3A0xb35a0cfb247f082e!2sTada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000';

  const mapEmbedSrc = React.useMemo(() => {
    if (!rawMapUrl || !rawMapUrl.trim()) return '';
    const trimmed = rawMapUrl.trim();
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : trimmed;
  }, [rawMapUrl]);

  const showMap = footer.showMap !== false && Boolean(mapEmbedSrc);

  // ── 3. FLOATING CIRCULAR SOCIAL BADGES ────────────────────────────────────
  const defaultSocials: FooterSocialLink[] = [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'youtube', url: 'https://youtube.com' },
  ];

  const rawSocials = footer.socials !== undefined ? footer.socials : defaultSocials;
  const validSocials = (Array.isArray(rawSocials) ? rawSocials : []).filter(
    (s) => Boolean(s && s.url && s.url.trim().length > 0)
  );

  // ── 4. ALL 4 COLUMNS AS FLEXIBLE LINK COLUMNS ─────────────────────────────
  const defaultCol1: FooterColumn = {
    title: 'Development',
    items: [
      { label: 'Master Layout', href: '#master-plan' },
      { label: 'Infrastructure & Amenities', href: '#amenities' },
      { label: 'Development Highlights', href: '#development-highlights' },
      { label: 'Venture Snapshot', href: '#stats-strip' },
    ],
  };

  const defaultCol2: FooterColumn = {
    title: 'Connectivity',
    items: [
      { label: 'Regional Hubs', href: '#locations' },
      { label: 'Highway Corridors', href: '#locations' },
      { label: 'Industrial Parks', href: '#locations' },
      { label: 'Nearby Transit', href: '#locations' },
    ],
  };

  const defaultCol3: FooterColumn = {
    title: 'Documentation',
    items: [
      { label: 'Project Brochure', href: '#brochure' },
      { label: 'Statutory FAQs', href: '#faqs' },
      { label: 'Title Scrutiny', href: '#about' },
      { label: 'Spot Registration', href: '#about' },
    ],
  };

  const defaultCol4: FooterColumn = {
    title: 'Direct Assistance',
    items: [
      { label: 'Schedule Free Site Visit', href: '#contact' },
      { label: 'Customer Relations', href: '#contact' },
      { label: 'On-Site Office Lounge', href: '#contact' },
      { label: 'Route & Navigation', href: '#locations' },
    ],
  };

  const col1 = footer.col1 !== undefined ? footer.col1 : defaultCol1;
  const col2 = footer.col2 !== undefined ? footer.col2 : defaultCol2;
  const col3 = footer.col3 !== undefined ? footer.col3 : defaultCol3;
  const col4 = footer.col4 !== undefined ? footer.col4 : defaultCol4;

  const hasColContent = (col?: FooterColumn) => {
    if (!col) return false;
    const hasTitle = Boolean(col.title && col.title.trim());
    const hasItems = Boolean(
      col.items && col.items.some((it) => it && it.label && it.label.trim())
    );
    return hasTitle || hasItems;
  };

  const hasCol1 = hasColContent(col1);
  const hasCol2 = hasColContent(col2);
  const hasCol3 = hasColContent(col3);
  const hasCol4 = hasColContent(col4);

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return (
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'linkedin':
        return (
          <span className="font-sans font-black text-white text-base leading-none">
            in
          </span>
        );
      case 'google':
        return (
          <span className="font-sans font-black text-white text-sm leading-none">
            G+
          </span>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'rss':
        return (
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
            <circle cx="6.18" cy="17.82" r="2.18" />
            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
          </svg>
        );
      default:
        return <ExternalLink className="w-4 h-4 text-white" />;
    }
  };

  const renderColumn = (col: FooterColumn | undefined, hasContent: boolean) => {
    if (!hasContent || !col) return null;
    return (
      <div className="space-y-3">
        {Boolean(col.title && col.title.trim()) && (
          <h4
            className="font-bold text-sm tracking-wide"
            style={{ color: textColor }}
          >
            {col.title}
          </h4>
        )}
        {Array.isArray(col.items) && col.items.length > 0 && (
          <ul className="space-y-2 text-xs">
            {col.items
              .filter((it) => it && it.label && it.label.trim())
              .map((item, idx) => (
                <li key={`${item.label}-${idx}`}>
                  <a
                    href={item.href || '#'}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className="text-slate-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{item.label}</span>
                    {item.isExternal && <ExternalLink className="w-3 h-3 opacity-60" />}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <footer
      id="site-footer"
      className="w-full relative transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* ── 1. TOP SECTION: FULL-WIDTH GOOGLE MAP (height: 280px to 360px) ── */}
      {showMap && (
        <div className="w-full h-[280px] sm:h-[330px] md:h-[360px] relative overflow-hidden bg-zinc-200">
          <iframe
            title="Location Map"
            src={mapEmbedSrc}
            width="100%"
            height="100%"
            className="w-full h-full border-0 block"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* ── 2. BOTTOM SECTION: BAND WITH OVERLAPPING FLOATING CARD ── */}
      <div className="relative pt-0 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative">
          {/* ── OVERLAPPED CARD ── */}
          <div
            className={`relative rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-black/5 z-10 ${
              showMap ? '-mt-12 sm:-mt-16 md:-mt-20' : 'mt-8'
            }`}
            style={{ backgroundColor: cardBgColor }}
          >
            {/* ── CIRCULAR SOCIAL BADGES PERCHED ON TOP EDGE ── */}
            {validSocials.length > 0 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 sm:gap-3 z-20">
                {validSocials.map((social, idx) => (
                  <a
                    key={`${social.platform}-${idx}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform.toUpperCase()}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    {renderSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}

            {/* Brand Logo & Tagline Header inside Card (Centered) */}
            <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-zinc-100 pt-2 space-y-2.5 max-w-2xl mx-auto">
              <div className="inline-block bg-white px-2.5 py-1 rounded-lg border border-zinc-200/80 shadow-xs mx-auto">
                <img
                  src="/sln_micro_templates_logo.webp"
                  alt="SLN Logo"
                  className="h-8 w-auto max-w-[160px] object-contain mx-auto"
                />
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 leading-tight tracking-tight uppercase">
                {venture.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
                {venture.tagline ||
                  'Where Your Vision Takes Shape, and Your Future Finds a Foundation.'}
              </p>

              {venture.contact?.phone && (
                <div className="pt-1 flex items-center justify-center gap-2 text-xs">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                    Direct Sales & Site Office:
                  </span>
                  <a
                    href={`tel:${venture.contact.phone}`}
                    className="font-mono text-xs sm:text-sm font-extrabold text-zinc-900 hover:text-emerald-600 transition-colors"
                  >
                    {venture.contact.phone}
                  </a>
                </div>
              )}
            </div>

            {/* 4 Flexible Link Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-6">
              {renderColumn(col1, hasCol1)}
              {renderColumn(col2, hasCol2)}
              {renderColumn(col3, hasCol3)}
              {renderColumn(col4, hasCol4)}
            </div>
          </div>

          {/* Bottom Copyright & Compliance Line */}
          <div
            className="pt-8 text-center text-xs font-mono"
            style={{ color: bottomTextColor }}
          >
            <p>
              {footer.copyrightText ||
                `© ${new Date().getFullYear()} ${venture.title} — SLNMPL. All rights reserved.`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
