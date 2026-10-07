import React from 'react';
import { VentureData } from '../types';
import { Phone, ArrowUp } from 'lucide-react';

interface FooterSectionProps {
  venture: VentureData;
}

export default function FooterSection({ venture }: FooterSectionProps) {
  const topMenuItems = [
    { label: 'Home', href: '#hero' },
    { label: 'Thesis', href: '#why-choose' },
    { label: 'Overview', href: '#about' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Master Plan', href: '#master-plan' },
    { label: 'Connectivity', href: '#locations' },
    { label: 'Site Visit', href: '#contact' },
  ];

  const phone = venture.contact?.phone;

  return (
    <footer className="bg-zinc-950 text-white pt-12 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 3-Column Balanced Grid (NO MAP) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-zinc-800/80 items-start">
          {/* Column 1: Brand & Overview (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="inline-block bg-white/95 px-3 py-1.5 rounded-md shadow-xs">
              <img
                src="/sln_micro_templates_logo.webp"
                alt="SLNMPL Logo"
                className="h-8 w-auto max-w-[160px] object-contain"
              />
            </div>

            <p className="text-xs text-zinc-300 font-normal leading-relaxed max-w-sm">
              {venture.title} — Ultra-modern master-planned plotted community engineered for
              sustained capital appreciation and immediate spot registration.
            </p>
          </div>

          {/* Column 2: Quick Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block font-bold">
              Site Navigation
            </span>
            <div className="flex flex-col space-y-2 text-xs text-zinc-300 font-medium">
              {topMenuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="hover:text-emerald-300 transition-colors w-fit"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Site Office / Experience Lounge (4 cols) */}
          <div className="md:col-span-4 space-y-3 bg-zinc-900/60 p-5 rounded-xl border border-zinc-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block font-bold">
                On-Site Experience Lounge
              </span>
              <h4 className="font-bold text-base text-white mt-1">
                {venture.contact?.loungeTitle || 'Site Office & Experience Center'}
              </h4>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed mt-1">
                {venture.contact?.branchAddress ||
                  'Highway Site Office, Tada-Sri City Bypass Road, Tada, Andhra Pradesh 524401.'}
              </p>
            </div>

            {/* Direct Sales Line - Only shown if phone is entered, NO fallback */}
            {Boolean(phone && phone.trim()) && (
              <div className="pt-3 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                      Direct Sales Line
                    </span>
                    <a
                      href={`tel:${phone}`}
                      className="font-bold text-white hover:text-emerald-400 text-xs font-mono transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-normal">
          <p>© {new Date().getFullYear()} SLNMPL. All Rights Reserved.</p>
          <a href="#hero" className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
