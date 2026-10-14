import React, { useState, useEffect } from 'react';
import { VentureData, LocationItem } from '../types';
import { SITE_CONFIG, getLocationAssetUrl } from '../siteConfig';
import {
  Navigation,
  Clock,
  Plane,
  Building2,
  MapPin,
  Train,
  Landmark,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface LocationsSectionProps {
  venture: VentureData;
}

export default function LocationsSection({ venture }: LocationsSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [liveLocations, setLiveLocations] = useState<LocationItem[]>(
    Array.isArray(venture.locations) && venture.locations.length > 0 ? venture.locations : []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!venture.locations || venture.locations.length === 0);

  // Fetch strictly live CMS prime locations from API
  useEffect(() => {
    let isMounted = true;
    const fetchLiveLocations = async () => {
      try {
        const vId = venture.ventureId || SITE_CONFIG.activeVentureId || '232';
        let res = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/venture-locations?venture_id=${vId}`);
        let json = res.ok ? await res.json() : null;

        // If specific venture query returned 0, fetch all active locations
        if (!json || !Array.isArray(json.data) || json.data.length === 0) {
          const fallbackRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/venture-locations`);
          if (fallbackRes.ok) {
            json = await fallbackRes.json();
          }
        }

        if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: LocationItem[] = json.data.map((n: any, idx: number) => ({
            id: n.id ? Number(n.id) : idx + 1,
            title: n.title || 'Prime Landmark',
            distance: n.distance
              ? String(n.distance).toUpperCase().includes('KM')
                ? String(n.distance).toUpperCase()
                : `${n.distance} KM`
              : '—',
            travelTime: n.travel_time || '10 Mins Drive',
            group: n.group ? String(n.group).trim() : 'Connectivity',
            image: getLocationAssetUrl(n.image_url || n.image),
            desc: n.description || n.desc || '',
          }));
          if (isMounted) {
            setLiveLocations(mapped);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[LocationsSection] Live locations fetch failed:', err);
      }
      if (isMounted) {
        if (venture.locations && venture.locations.length > 0) {
          setLiveLocations(venture.locations);
        }
        setIsLoading(false);
      }
    };

    fetchLiveLocations();
    return () => {
      isMounted = false;
    };
  }, [venture.ventureId, venture.locations]);

  // Derive unique filter groups purely from the loaded live data
  const uniqueGroups = Array.from(new Set(liveLocations.map((l) => l.group))).filter(Boolean);

  const getGroupIcon = (groupName: string) => {
    const g = groupName.toLowerCase();
    if (g.includes('airport') || g.includes('flight') || g.includes('aviation')) return <Plane className="w-3.5 h-3.5" />;
    if (g.includes('transit') || g.includes('rail') || g.includes('station') || g.includes('train')) return <Train className="w-3.5 h-3.5" />;
    if (g.includes('school') || g.includes('college') || g.includes('education') || g.includes('univ')) return <GraduationCap className="w-3.5 h-3.5" />;
    if (g.includes('temple') || g.includes('heritage') || g.includes('historic')) return <Landmark className="w-3.5 h-3.5" />;
    return <Building2 className="w-3.5 h-3.5" />;
  };

  const groups = [
    { key: 'all', label: 'All Prime Locations', icon: <Sparkles className="w-3.5 h-3.5" /> },
    ...uniqueGroups.map((grp) => ({
      key: grp,
      label: grp,
      icon: getGroupIcon(grp),
    })),
  ];

  const filteredLocations =
    selectedGroup === 'all'
      ? liveLocations
      : liveLocations.filter((l) => l.group?.toLowerCase() === selectedGroup.toLowerCase());

  return (
    <section id="locations" className="py-20 lg:py-28 bg-[#fafaf9] border-b border-zinc-200/90 text-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header: Strictly normalized to Regional Connectivity with no badges or pill counters */}
        <div className="pb-3 border-b border-zinc-200/80">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Regional Connectivity
          </h2>
        </div>

        {/* Clean Filter Bar */}
        {groups.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {groups.map((grp) => {
              const isActive = selectedGroup === grp.key;
              return (
                <button
                  key={grp.key}
                  type="button"
                  onClick={() => setSelectedGroup(grp.key)}
                  className={`px-4 py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm border border-zinc-900 font-semibold'
                      : 'bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/90'
                  }`}
                >
                  {grp.icon}
                  <span>{grp.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Location Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-zinc-200/60 animate-pulse" />
            ))}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No prime locations found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[380px]"
              >
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={loc.image}
                    alt={loc.title}
                    loading="lazy"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                {/* Card Content Perched on Bottom */}
                <div className="relative z-10 mt-auto p-5 space-y-2 text-white">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{loc.distance}</span>
                    {loc.travelTime && (
                      <>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-300 flex items-center gap-1 font-normal">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {loc.travelTime}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                    {loc.title}
                  </h3>

                  {loc.desc && (
                    <p className="text-xs text-zinc-300 line-clamp-2 font-normal leading-relaxed">
                      {loc.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
