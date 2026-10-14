import React, { useState, useEffect } from 'react';
import { VentureData } from './types';
import { micrositeService } from './services/micrositeService';
import { updateDocumentSeo } from './utils/seoManager';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CinematicVideoSection from './components/CinematicVideoSection';
import DevelopmentHighlightsSection from './components/DevelopmentHighlightsSection';
import StatsBadges from './components/StatsBadges';
import WhyChooseSection from './components/WhyChooseSection';
import AboutSection from './components/AboutSection';
import AmenitiesSection from './components/AmenitiesSection';
import MasterPlanSection from './components/MasterPlanSection';
import LocationsSection from './components/LocationsSection';
import BrochureBanner from './components/BrochureBanner';
import FaqSection from './components/FaqSection';
import ContactFormSection from './components/ContactFormSection';
import FooterSection from './components/FooterSection';
import MicrositeSkeleton from './components/MicrositeSkeleton';
import ElevenLabsWidgets from './components/ElevenLabsWidgets';

export default function App() {
  const [currentVenture, setCurrentVenture] = useState<VentureData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveVenture = async () => {
      setIsLoading(true);
      try {
        const live = await micrositeService.loadActiveVenture();
        if (isMounted) {
          if (live) {
            setCurrentVenture(live);
            updateDocumentSeo(live);
          } else {
            console.warn('[App] Could not load venture, using default');
          }
        }
      } catch (err) {
        console.error('[App] Error loading live venture:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLiveVenture();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentVenture) {
      updateDocumentSeo(currentVenture);
    }
  }, [currentVenture]);

  // Apply dynamic color palette from CMS by injecting CSS custom properties.
  // Tailwind utility classes reference these vars (--primary, --background, etc.)
  useEffect(() => {
    if (!currentVenture?.colorPalette) return;
    const p = currentVenture.colorPalette;
    const root = document.documentElement;

    // Inline hex → "H S% L%" converter
    const hexToHsl = (hex: string): string => {
      let r = 0, g = 0, b = 0;
      const h = hex.replace('#', '');
      if (h.length === 6) {
        r = parseInt(h.slice(0, 2), 16) / 255;
        g = parseInt(h.slice(2, 4), 16) / 255;
        b = parseInt(h.slice(4, 6), 16) / 255;
      }
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let hh = 0, ss = 0;
      const ll = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        ss = ll > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: hh = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: hh = ((b - r) / d + 2) / 6; break;
          case b: hh = ((r - g) / d + 4) / 6; break;
        }
      }
      return `${Math.round(hh * 360)} ${Math.round(ss * 100)}% ${Math.round(ll * 100)}%`;
    };

    // 1. Tailwind v4 utility color overrides
    root.style.setProperty('--color-emerald-50', p.background);
    root.style.setProperty('--color-emerald-100', p.borderColor || p.background);
    root.style.setProperty('--color-emerald-400', p.accent);
    root.style.setProperty('--color-emerald-500', p.accent);
    root.style.setProperty('--color-emerald-600', p.primary);
    root.style.setProperty('--color-emerald-700', p.accentHover || p.primary);
    root.style.setProperty('--color-emerald-800', p.primary);

    // 2. Standard CSS custom properties
    root.style.setProperty('--primary', hexToHsl(p.primary));
    root.style.setProperty('--ring', hexToHsl(p.primary));
    root.style.setProperty('--background', hexToHsl(p.background));
    root.style.setProperty('--card', hexToHsl(p.cardBg));
    root.style.setProperty('--border', hexToHsl(p.borderColor));
    root.style.setProperty('--foreground', hexToHsl(p.textPrimary));
    root.style.setProperty('--card-foreground', hexToHsl(p.textPrimary));
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    // Persist raw hex
    root.style.setProperty('--palette-primary-hex', p.primary);
    root.style.setProperty('--palette-accent-hex', p.accent);
    root.style.setProperty('--palette-bg', p.background);
    root.style.setProperty('--foreground-hex', p.textPrimary);

    document.body.style.backgroundColor = p.background;
  }, [currentVenture]);

  if (isLoading || !currentVenture) {
    return <MicrositeSkeleton />;
  }

  return (
    <div
      className="min-h-screen font-sans selection:bg-rose-500/20 selection:text-rose-500 transition-colors duration-300"
      style={{
        backgroundColor: currentVenture?.colorPalette?.background || undefined,
        color: currentVenture?.colorPalette?.textPrimary || undefined,
      }}
    >
      <Navbar venture={currentVenture} />
      <main>
        {/* Section 1: Hero Section */}
        <HeroSection venture={currentVenture} />

        {/* Section 2: Cinematic Drone/Vimeo Video Section (Completely hidden if no video exists) */}
        {(currentVenture.vimeoId || currentVenture.vimeoUrl) && (
          <CinematicVideoSection venture={currentVenture} />
        )}

        {/* Section 3: Development Highlights Section */}
        <DevelopmentHighlightsSection venture={currentVenture} />

        {/* Section 4: Venture Snapshot / Stats Strip with 3D flip cards */}
        <StatsBadges venture={currentVenture} />

        {/* Section 5: Why This Location */}
        <WhyChooseSection venture={currentVenture} />

        {/* Section 6: Lifestyle & Master Planning (About) */}
        <AboutSection venture={currentVenture} />

        {/* Section 7: Infrastructure & Amenities */}
        <AmenitiesSection venture={currentVenture} />

        {/* Section 8: Interactive 2D & 3D Master Plan */}
        <MasterPlanSection venture={currentVenture} />

        {/* Section 9: Regional Connectivity */}
        <LocationsSection venture={currentVenture} />

        {/* Section 10: Official Project Brochure */}
        <BrochureBanner venture={currentVenture} />

        {/* Section 11: Frequently Asked Questions */}
        <FaqSection venture={currentVenture} />

        {/* Section 12: VIP Site Visit Booking Form */}
        <ContactFormSection venture={currentVenture} />
      </main>

      {/* Section 13: Footer Section with dynamic 4 columns, social links, and Google Map */}
      <FooterSection venture={currentVenture} />

      {/* Real-time ElevenLabs Chat & Voice AI Assistants */}
      {currentVenture && (
        <ElevenLabsWidgets
          chatbotAgentId={currentVenture.chatbotAgentId}
          voicebotAgentId={currentVenture.voicebotAgentId}
        />
      )}
    </div>
  );
}
