import React, { useState, useEffect } from 'react';
import { VentureData, AmenityItem } from '../types';
import { SITE_CONFIG, getLocationAssetUrl } from '../siteConfig';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Shield,
  Droplets,
  Zap,
  Trees,
  Milestone,
  Sparkles,
  Building2,
  Compass,
  Waves,
  Flame,
  Wifi,
} from 'lucide-react';

interface AmenitiesSectionProps {
  venture: VentureData;
}

function resolveAmenityCategory(title: string, category?: string): string {
  if (category && category !== 'General' && category.trim()) return category;
  const t = (title || '').toLowerCase();
  if (t.includes('wifi') || t.includes('internet') || t.includes('fiber')) return 'Connectivity';
  if (t.includes('power') || t.includes('electric') || t.includes('sewage') || t.includes('drain') || t.includes('pipe')) return 'Utilities';
  if (t.includes('pool') || t.includes('swim') || t.includes('club') || t.includes('play')) return 'Recreation';
  if (t.includes('fire') || t.includes('safety') || t.includes('security')) return 'Safety';
  if (t.includes('arch') || t.includes('entrance') || t.includes('gate')) return 'Architecture';
  return 'Infrastructure';
}

function resolveAmenityDescription(title: string, desc?: string): string {
  if (desc && desc.trim() && desc.trim().toLowerCase() !== (title || '').trim().toLowerCase()) {
    return desc.trim();
  }
  const t = (title || '').toLowerCase();
  if (t.includes('wifi')) return 'High-speed dedicated fiber optic connectivity integrated throughout the layout.';
  if (t.includes('power')) return 'Dedicated underground power cabling with individual plot feeder pillars.';
  if (t.includes('pool')) return 'Resort-style luxury community swimming pool and relaxation deck.';
  if (t.includes('sewage') || t.includes('pipe') || t.includes('drain')) return '100% concealed underground sewage pipeline & stormwater drainage network.';
  if (t.includes('fire')) return 'Modern certified fire prevention infrastructure and safety hydrants.';
  if (t.includes('arch') || t.includes('entrance')) return 'Monumental architectural gateway with 24/7 guarded security access.';
  return 'High-specification development amenity adhering to supreme master planning protocols.';
}

const DEFAULT_API_AMENITIES: AmenityItem[] = [
  {
    id: 1,
    title: 'WiFi',
    category: 'Connectivity',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236429_wifi.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236429_wifi.png',
    desc: 'High-speed dedicated fiber optic connectivity integrated throughout the layout.',
  },
  {
    id: 2,
    title: 'Power Connection',
    category: 'Utilities',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236449_power-connection.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236449_power-connection.png',
    desc: 'Dedicated underground power cabling with individual plot feeder pillars.',
  },
  {
    id: 3,
    title: 'Swimming Pool',
    category: 'Recreation',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236466_swimming-pool.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236466_swimming-pool.png',
    desc: 'Resort-style luxury community swimming pool and relaxation deck.',
  },
  {
    id: 4,
    title: 'Sewage pipe',
    category: 'Utilities',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236485_sewage-pipe.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236485_sewage-pipe.png',
    desc: '100% concealed underground sewage pipeline & stormwater drainage network.',
  },
  {
    id: 5,
    title: 'Fire Safety Equipment',
    category: 'Safety',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236496_fire-safety-equipment.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236496_fire-safety-equipment.png',
    desc: 'Modern certified fire prevention infrastructure and safety hydrants.',
  },
  {
    id: 6,
    title: 'GRAND ENTRANCE ARCH',
    category: 'Architecture',
    image: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236515_grand-entrance-arch.png',
    iconImage: 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236515_grand-entrance-arch.png',
    desc: 'Monumental architectural gateway with 24/7 guarded security access.',
  },
];

export default function AmenitiesSection({ venture }: AmenitiesSectionProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [amenities, setAmenities] = useState<AmenityItem[]>(() => {
    if (Array.isArray(venture.amenities) && venture.amenities.length > 0) {
      const hasRealImages = venture.amenities.some((a) => a.image && a.image.includes('uploads/amenities'));
      if (hasRealImages) return venture.amenities;
    }
    return DEFAULT_API_AMENITIES;
  });

  // Strictly query live CMS API: /cms/amenities
  useEffect(() => {
    let isMounted = true;
    const fetchApiAmenities = async () => {
      try {
        const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/amenities`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: AmenityItem[] = json.data.map((a: any, idx: number) => {
              const title = a.title || a.display_name || 'Amenity';
              return {
                id: a.id ? Number(a.id) : idx + 1,
                title: title,
                icon: a.icon || 'Sparkles',
                category: resolveAmenityCategory(title, a.category),
                desc: resolveAmenityDescription(title, a.description),
                image: getLocationAssetUrl(a.icon_image_url || a.image_url || a.icon_image || a.image),
                iconImage: getLocationAssetUrl(a.icon_image_url || a.icon_image),
                color: a.color,
                badge: a.badge,
              };
            });
            if (isMounted) {
              setAmenities(mapped);
            }
          }
        }
      } catch (err) {
        console.warn('[AmenitiesSection] Live API fetch failed:', err);
      }
    };

    fetchApiAmenities();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = Array.from(new Set(amenities.map((a) => a.category || 'General')));

  const getAmenityImage = (amenity: any): string => {
    if (amenity.image && typeof amenity.image === 'string' && amenity.image.trim()) {
      return amenity.image.startsWith('http') ? amenity.image : getLocationAssetUrl(amenity.image);
    }
    if (amenity.iconImage && typeof amenity.iconImage === 'string' && amenity.iconImage.trim()) {
      return amenity.iconImage.startsWith('http') ? amenity.iconImage : getLocationAssetUrl(amenity.iconImage);
    }
    if (amenity.image_url && typeof amenity.image_url === 'string' && amenity.image_url.trim()) {
      return amenity.image_url;
    }
    if (amenity.icon_image_url && typeof amenity.icon_image_url === 'string' && amenity.icon_image_url.trim()) {
      return amenity.icon_image_url;
    }
    return 'https://cms.slnmplapp.com/core/public/uploads/amenities/1790236515_grand-entrance-arch.png';
  };

  const getAmenityIcon = (title: string, category?: string) => {
    const t = `${title} ${category || ''}`.toLowerCase();
    if (t.includes('wifi') || t.includes('internet')) return <Wifi className="w-5 h-5 text-sky-600" />;
    if (t.includes('power') || t.includes('electric') || t.includes('lightning') || t.includes('solar')) return <Zap className="w-5 h-5 text-amber-600" />;
    if (t.includes('pool') || t.includes('swim')) return <Waves className="w-5 h-5 text-cyan-600" />;
    if (t.includes('pipe') || t.includes('sewage') || t.includes('drain') || t.includes('water')) return <Droplets className="w-5 h-5 text-sky-600" />;
    if (t.includes('fire') || t.includes('safety')) return <Flame className="w-5 h-5 text-rose-600" />;
    if (t.includes('arch') || t.includes('entrance') || t.includes('architecture')) return <Building2 className="w-5 h-5 text-emerald-700" />;
    if (t.includes('security') || t.includes('wall') || t.includes('guard')) return <Shield className="w-5 h-5 text-emerald-600" />;
    if (t.includes('tree') || t.includes('plant') || t.includes('eco') || t.includes('green')) return <Trees className="w-5 h-5 text-emerald-600" />;
    return <Sparkles className="w-5 h-5 text-emerald-600" />;
  };

  const filteredAmenities = activeTab === 'all'
    ? amenities
    : amenities.filter((a) => (a.category || 'General').toLowerCase() === activeTab.toLowerCase());

  return (
    <section id="amenities" className="py-20 lg:py-28 bg-[#fafaf9] text-zinc-900 border-b border-zinc-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-zinc-200/80">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3 text-xs font-mono uppercase tracking-wider border-emerald-600/30 text-emerald-700 bg-emerald-50">
              Engineered Infrastructure
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              Master Plan Infrastructure & Amenities
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2 font-normal leading-relaxed">
              Every detail is conceived for generational longevity, underground utility reliability, and seamless community living.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-end">
            <span className="text-xs font-mono text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-2xs">
              Showing <strong className="text-zinc-900 font-semibold">{filteredAmenities.length}</strong> of {amenities.length} Amenities
            </span>
          </div>
        </div>

        {/* Clean, Organized Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white shadow-sm border border-zinc-900 font-semibold'
                : 'bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/90'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
              activeTab === 'all' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {amenities.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = amenities.filter((a) => (a.category || 'General').toLowerCase() === cat.toLowerCase()).length;
            const isActive = activeTab.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat.toLowerCase())}
                className={`px-4 py-2 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm border border-zinc-900 font-semibold'
                    : 'bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/90'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Amenities Cards Grid with High-Quality Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmenities.map((amenity, idx) => {
            const imageUrl = getAmenityImage(amenity);
            const icon = getAmenityIcon(amenity.title, amenity.category);

            return (
              <Card
                key={amenity.id || idx}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={imageUrl}
                      alt={amenity.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {/* Bottom subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Floating Category Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/95 backdrop-blur-md text-zinc-900 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-zinc-200 shadow-xs"
                      >
                        {amenity.category || 'General'}
                      </Badge>
                    </div>

                    {/* Floating Icon Badge on Bottom Left */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 text-emerald-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors tracking-tight line-clamp-1">
                      {amenity.title}
                    </h3>
                    <p className="text-zinc-600 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed font-normal">
                      {amenity.desc || 'High-specification development amenity adhering to supreme master planning protocols.'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
