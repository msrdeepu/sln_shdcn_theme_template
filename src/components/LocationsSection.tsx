import React, { useState } from 'react';
import { VentureData } from '../types';
import { getLocationAssetUrl } from '../siteConfig';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Navigation, Clock } from 'lucide-react';

interface LocationsSectionProps {
  venture: VentureData;
}

export default function LocationsSection({ venture }: LocationsSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string | number, boolean>>({});

  const toggleExpand = (id: string | number) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const locations = Array.isArray(venture.locations) && venture.locations.length > 0
    ? venture.locations
    : [
        { id: 1, title: 'Tirupati International Airport', distance: '10 km', travelTime: '15 Mins', group: 'AIRPORT', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', desc: 'Rapid airport connectivity for domestic and regional transit.' },
        { id: 2, title: 'Sri City Industrial Hub', distance: '8 km', travelTime: '12 Mins', group: 'INDUSTRY', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', desc: 'Home to 220+ multinational corporations and manufacturing campuses.' },
        { id: 3, title: 'Srikalahasti Temple Town', distance: '15 km', travelTime: '20 Mins', group: 'HERITAGE', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', desc: 'Spiritual landmark and historic town centre with bustling commerce.' },
        { id: 4, title: 'Tada Railway Junction', distance: '5 km', travelTime: '8 Mins', group: 'TRANSIT', image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80', desc: 'Suburban train junction linking Chennai central and Nellore corridors.' },
      ];

  const groups = ['ALL', ...Array.from(new Set(locations.map((l) => (l.group || 'CONNECTIVITY').toUpperCase())))];

  const filteredLocations = selectedGroup === 'ALL'
    ? locations
    : locations.filter((l) => (l.group || 'CONNECTIVITY').toUpperCase() === selectedGroup);

  const formatGroupLabel = (grp: string) => {
    if (grp === 'ALL') return 'All Locations';
    if (grp === 'TOWN') return 'Nearby Town';
    return grp
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <section id="locations" className="py-20 lg:py-28 bg-[#fafaf9] border-b border-zinc-200/90 text-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header with Familiar English */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-zinc-200/80">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3 text-xs font-mono uppercase tracking-wider border-emerald-600/30 text-emerald-700 bg-emerald-50">
              Prime Locations
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              Prime Locations & Connectivity
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2 font-normal leading-relaxed">
              Conveniently connected to major transit hubs, schools, hospitals, industrial corridors, and everyday destinations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-end">
            <span className="text-xs font-mono text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-2xs">
              Showing <strong className="text-zinc-900 font-semibold">{filteredLocations.length}</strong> of {locations.length} Locations
            </span>
          </div>
        </div>

        {/* Clean, Organized Category Filter Bar with Familiar Labels */}
        {groups.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {groups.map((grp) => {
              const count = grp === 'ALL'
                ? locations.length
                : locations.filter((l) => (l.group || 'CONNECTIVITY').toUpperCase() === grp).length;
              const isActive = selectedGroup === grp;

              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-4 py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm border border-zinc-900 font-semibold'
                      : 'bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/90'
                  }`}
                >
                  <span>{formatGroupLabel(grp)}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLocations.map((loc, idx) => (
            <Card
              key={loc.id || idx}
              className="bg-white border-zinc-200 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                <img
                  src={loc.image ? getLocationAssetUrl(loc.image) : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'}
                  alt={loc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-zinc-800 text-[10px] font-mono border-zinc-200 shadow-xs uppercase font-bold"
                >
                  {loc.group || 'Node'}
                </Badge>
              </div>

              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 text-base group-hover:text-emerald-700 transition-colors">
                    {loc.title}
                  </h3>
                  {loc.desc && (
                    <div>
                      <p
                        className={`text-xs text-zinc-500 mt-1 leading-relaxed font-normal transition-all ${
                          expandedIds[loc.id || idx] ? '' : 'line-clamp-2'
                        }`}
                      >
                        {loc.desc}
                      </p>
                      {loc.desc.length > 50 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(loc.id || idx)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-1 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                        >
                          {expandedIds[loc.id || idx] ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{loc.distance}</span>
                  </div>
                  {loc.travelTime && (
                    <div className="flex items-center gap-1 text-zinc-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{loc.travelTime}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
