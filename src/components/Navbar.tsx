import React, { useState, useEffect } from 'react';
import { VentureData } from '../types';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu, ArrowRight, Calendar, Phone } from 'lucide-react';

interface NavbarProps {
  venture: VentureData;
}

export default function Navbar({ venture }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if video mode is active
  const rawVimeoId = (venture.vimeoId || venture.vimeoUrl || '').trim();
  const cleanVimeoId = (() => {
    if (!rawVimeoId) return '';
    const match = rawVimeoId.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)?([0-9a-zA-Z_-]+)/);
    return match ? match[1] : rawVimeoId;
  })();
  const hasVideo = Boolean(cleanVimeoId);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Thesis', href: '#why-choose' },
    { label: 'Overview', href: '#about' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Master Plan', href: '#master-plan' },
    { label: 'Connectivity', href: '#locations' },
    { label: 'FAQs', href: '#faqs' },
  ];

  const phone = venture.contact?.phone;

  // Modern Housy-style header: clean, airy, light navigation
  const isLightHeader = !hasVideo || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isLightHeader
          ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 text-zinc-900 shadow-xs py-3.5'
          : 'bg-gradient-to-b from-black/70 to-transparent border-b border-white/10 text-white py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="bg-white px-2 py-1 rounded-xl shadow-xs border border-zinc-200/80 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/sln_micro_templates_logo.webp"
              alt="SLN Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <span
              className={`text-sm sm:text-base font-extrabold tracking-tight block transition-colors ${
                isLightHeader ? 'text-zinc-950 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-400'
              }`}
            >
              {venture.title}
            </span>
          </div>
        </a>

        {/* Desktop Navigation — Clean, airy links matching Housy reference (no dark pill capsule) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                idx === 0
                  ? isLightHeader
                    ? 'text-zinc-950 font-bold'
                    : 'text-white font-bold'
                  : isLightHeader
                  ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className={`hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                isLightHeader
                  ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
                  : 'text-zinc-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{phone}</span>
            </a>
          )}

          {/* Rounded Pill CTA matching the Housy 'Sign up' green button */}
          <Button
            size="sm"
            className="hidden sm:inline-flex gap-1.5 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm h-10 px-5 rounded-full cursor-pointer transition-all hover:scale-102"
            asChild
          >
            <a href="#contact">
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Site Visit</span>
            </a>
          </Button>

          {/* Mobile Menu Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="iconSm"
                className={`md:hidden ${
                  isLightHeader
                    ? 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-zinc-200 text-zinc-900 flex flex-col p-6 shadow-2xl">
              <div className="flex-1 flex flex-col overflow-y-auto">
                <SheetHeader className="pb-3 border-b border-zinc-100 text-left pr-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-xs border border-zinc-200/90 shrink-0">
                      <img src="/sln_micro_templates_logo.webp" alt="SLN" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="text-left text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                        {venture.title}
                      </SheetTitle>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex flex-col gap-1 mt-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between text-sm font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2.5 rounded-xl hover:bg-zinc-100/90 border border-transparent hover:border-zinc-200/80 transition-all"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 mt-auto shrink-0">
                <Button className="w-full gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full h-11" asChild>
                  <a href="#contact">
                    <Calendar className="w-4 h-4" />
                    <span>Book Site Visit</span>
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
