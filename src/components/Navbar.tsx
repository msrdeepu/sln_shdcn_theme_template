import React, { useState, useEffect } from 'react';
import { VentureData } from '../types';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import {
  Menu,
  ArrowRight,
  Calendar,
  Phone,
  Home,
  Sparkles,
  BarChart3,
  Compass,
  TreePine,
  Palmtree,
  Layers,
  Navigation,
  FileText,
  HelpCircle,
  CalendarCheck,
} from 'lucide-react';

interface NavbarProps {
  venture: VentureData;
}

export default function Navbar({ venture }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Complete 11 sections matching Theme 3
  const allNavLinks = [
    { label: 'Home', href: '#hero', icon: Home },
    { label: 'Development Highlights', href: '#development-highlights', icon: Sparkles },
    { label: 'Venture Snapshot', href: '#stats-strip', icon: BarChart3 },
    { label: 'Why This Location', href: '#why-choose', icon: Compass },
    { label: 'Lifestyle & Master Planning', href: '#about', icon: TreePine },
    { label: 'Infrastructure & Amenities', href: '#amenities', icon: Palmtree },
    { label: 'Interactive Layout', href: '#master-plan', icon: Layers },
    { label: 'Regional Connectivity', href: '#locations', icon: Navigation },
    { label: 'Project Brochure', href: '#brochure', icon: FileText },
    { label: 'FAQs', href: '#faqs', icon: HelpCircle },
    { label: 'Site Visit Booking', href: '#contact', icon: CalendarCheck },
  ];

  const phone = venture.contact?.phone;

  const handleLinkClick = (href: string) => {
    setSheetOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      window.location.hash = href;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70 text-zinc-900 shadow-xs ${
        scrolled ? 'py-3' : 'py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('#hero');
          }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="bg-white px-2 py-1 rounded-xl shadow-xs border border-zinc-200/80 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/sln_micro_templates_logo.webp"
              alt="SLN Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm sm:text-base font-extrabold tracking-tight block text-zinc-950 group-hover:text-emerald-600 transition-colors">
              {venture.title}
            </span>
          </div>
        </a>

        {/* Right Actions: Free Site Visit CTA & Beautiful Rounded Menu Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/90 border border-transparent hover:border-zinc-200/80 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{phone}</span>
            </a>
          )}

          {/* CTA Button: Free Site Visit */}
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-900/10 hover:shadow-lg h-10 px-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            onClick={() => handleLinkClick('#contact')}
          >
            <Calendar className="w-4 h-4" />
            <span>Free Site Visit</span>
          </button>

          {/* Beautiful Rounded Hamburger Menu Button: Opens 11-Section Side Drawer */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-zinc-100/90 hover:bg-white text-zinc-800 hover:text-emerald-600 border border-zinc-200/90 hover:border-emerald-500/80 shadow-xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer group"
                aria-label="Toggle navigation menu"
                title="Navigation Menu"
              >
                <Menu className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-zinc-200 text-zinc-900 flex flex-col p-6 shadow-2xl w-full sm:max-w-md">
              <div className="flex-1 flex flex-col overflow-y-auto">
                <SheetHeader className="pb-3 border-b border-zinc-100 text-left pr-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-xs border border-zinc-200/90 shrink-0">
                      <img src="/sln_micro_templates_logo.webp" alt="SLN" className="h-8 w-auto object-contain" />
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="text-left text-base font-bold text-zinc-900 leading-tight">
                        {venture.title}
                      </SheetTitle>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex flex-col gap-1 mt-4">
                  {allNavLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(link.href);
                        }}
                        className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2.5 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200/80 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2.5">
                          <IconComponent className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{link.label}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 mt-auto shrink-0 space-y-2">
                <Button
                  className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl h-10"
                  onClick={() => handleLinkClick('#contact')}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Free Site Visit</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
