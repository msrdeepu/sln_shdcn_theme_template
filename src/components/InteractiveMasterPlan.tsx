import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import {
  ArrowLeft,
  Search,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Scale,
  Box,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { InteractiveMapData, InteractiveMapPlot } from '../types/interactiveMap';
import { micrositeService } from '../services/micrositeService';
import { VentureData } from '../types';
import { getMapAssetUrl, SITE_CONFIG } from '../siteConfig';
import Venture3DCanvas, { PropertyDetails } from './Venture3DCanvas';
import PlotComparisonDock from './PlotComparisonDock';
import PlotComparisonMatrixModal from './PlotComparisonMatrixModal';

interface InteractiveMasterPlanProps {
  venture: VentureData;
  theme?: any;
  onSelectPlotForEnquiry?: (plot: InteractiveMapPlot) => void;
}

function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function InteractiveMasterPlan({
  venture,
  theme,
  onSelectPlotForEnquiry,
}: InteractiveMasterPlanProps) {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<InteractiveMapData | null>(null);

  // Max View (Full View / Fullscreen Overlay matching reference app)
  const [isMaxView, setIsMaxView] = useState<boolean>(false);

  // View Mode: '3d' (Three.js 3D Drone World) vs '2d' (Cadastral Layout Blueprint)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedFacingFilter, setSelectedFacingFilter] = useState<string>('ALL');
  const [showFiltersBar, setShowFiltersBar] = useState<boolean>(false);

  // Selected Plot for 3D Camera Focus & Specification Sheet
  const [selectedPlot, setSelectedPlot] = useState<InteractiveMapPlot | null>(null);

  // Multi-Plot Comparison State
  const [comparedPlots, setComparedPlots] = useState<InteractiveMapPlot[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // 2D Perspective Tilt State
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [pitchAngle, setPitchAngle] = useState<number>(0);

  // Zoom Percentage State
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Fetch Map Data
  const loadMapData = useCallback(() => {
    setLoading(true);
    setError(null);
    const ventureId = venture.ventureId || (venture as any).venture_id || SITE_CONFIG.activeVentureId;

    micrositeService
      .fetchInteractiveMap(ventureId)
      .then((data) => {
        if (data && data.plots && data.plots.length > 0) {
          setMapData(data);
        } else if (data && data.map && data.map.image_url) {
          setMapData(data);
        } else {
          setError('Interactive map layout currently being finalized.');
        }
      })
      .catch((err) => {
        console.warn('[InteractiveMasterPlan] Error fetching map:', err);
        setError('Interactive master plan will be available shortly.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [venture]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Handle ESC key to exit Max View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaxView) {
        setIsMaxView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaxView]);

  // Lock body scroll when Max View is active
  useEffect(() => {
    if (isMaxView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaxView]);

  // Unique Statuses & Facings
  const availableStatuses = useMemo(() => {
    if (!mapData?.plots) return [];
    const set = new Set<string>();
    mapData.plots.forEach((p) => {
      if (p.status) set.add(p.status.trim());
    });
    return Array.from(set);
  }, [mapData]);

  const availableFacings = useMemo(() => {
    if (!mapData?.plots) return [];
    const set = new Set<string>();
    mapData.plots.forEach((p) => {
      if (p.facing) set.add(p.facing.trim().toUpperCase());
    });
    return Array.from(set);
  }, [mapData]);

  // Filter Matching
  const isPlotMatching = useCallback(
    (plot: InteractiveMapPlot) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!plot.plot_no?.toLowerCase().includes(q)) return false;
      }
      if (selectedStatusFilter !== 'ALL') {
        if (plot.status?.toLowerCase().trim() !== selectedStatusFilter.toLowerCase().trim()) {
          return false;
        }
      }
      if (selectedFacingFilter !== 'ALL') {
        if (plot.facing?.toUpperCase().trim() !== selectedFacingFilter.toUpperCase().trim()) {
          return false;
        }
      }
      return true;
    },
    [searchQuery, selectedStatusFilter, selectedFacingFilter]
  );

  const isAnyFilterActive = useMemo(() => {
    return searchQuery.trim() !== '' || selectedStatusFilter !== 'ALL' || selectedFacingFilter !== 'ALL';
  }, [searchQuery, selectedStatusFilter, selectedFacingFilter]);

  const matchedPlotsCount = useMemo(() => {
    if (!mapData?.plots) return 0;
    return mapData.plots.filter(isPlotMatching).length;
  }, [mapData, isPlotMatching]);

  // Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapData?.plots) return;
    const match = mapData.plots.find(
      (p) => p.plot_no.toLowerCase().trim() === searchQuery.toLowerCase().trim()
    );
    if (match) {
      setSelectedPlot(match);
    }
  };

  // WhatsApp Share Generator
  const handleWhatsAppShare = useCallback(
    (plot: InteractiveMapPlot) => {
      const vTitle = venture.title || mapData?.venture.name || 'SLN Luxury Project';
      const facing = plot.facing ? `${plot.facing} Facing` : '';
      const price = plot.total_cost ? formatINR(plot.total_cost) : '';
      const text = `Hi, I am interested in Plot #${plot.plot_no} (${plot.status}) at ${vTitle}. ${facing} ${
        price ? `Price: ${price}` : ''
      }. Please share brochure and spot visit booking details.`;
      const phone = venture.contact?.whatsapp || '919848012345';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    },
    [venture, mapData]
  );

  // Book Site Visit Action
  const handleBookSiteVisit = useCallback(
    (plot: InteractiveMapPlot) => {
      if (onSelectPlotForEnquiry) {
        onSelectPlotForEnquiry(plot);
      }
      if (isMaxView) {
        setIsMaxView(false);
      }
      const contactElem = document.getElementById('contact');
      if (contactElem) {
        contactElem.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [onSelectPlotForEnquiry, isMaxView]
  );

  // Comparison Handlers
  const handleToggleCompare = useCallback((plot: InteractiveMapPlot) => {
    setComparedPlots((prev) => {
      const exists = prev.some((p) => p.property_id === plot.property_id);
      if (exists) {
        return prev.filter((p) => p.property_id !== plot.property_id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 plots simultaneously.');
        return prev;
      }
      return [...prev, plot];
    });
  }, []);

  const handleRemoveFromCompare = useCallback((propertyId: number) => {
    setComparedPlots((prev) => prev.filter((p) => p.property_id !== propertyId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setComparedPlots([]);
    setShowCompareModal(false);
  }, []);

  const handleAddPlotToCompare = useCallback((plot: InteractiveMapPlot) => {
    setComparedPlots((prev) => {
      if (prev.some((p) => p.property_id === plot.property_id)) return prev;
      if (prev.length >= 4) {
        alert('You can compare up to 4 plots simultaneously.');
        return prev;
      }
      return [...prev, plot];
    });
  }, []);

  // Plot Details Lookup Map for Comparison Matrix
  const plotDetailsMap: Record<number, PropertyDetails> = useMemo(() => {
    if (!mapData?.plots) return {};
    const map: Record<number, PropertyDetails> = {};
    mapData.plots.forEach((p) => {
      map[p.property_id] = p as any;
    });
    return map;
  }, [mapData]);

  // Live Plot Details State for selected plot specs
  const [plotDetailsState, setPlotDetailsState] = useState<PropertyDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedPlot) {
      setPlotDetailsState(null);
      setDetailsLoading(false);
      return;
    }

    // Instantly seed with available plot data so there's zero UI lag
    const initialSpecs = (plotDetailsMap[selectedPlot.property_id] || selectedPlot) as any;
    setPlotDetailsState(initialSpecs);

    const propId = selectedPlot.property_id || selectedPlot.plot_no;
    if (propId) {
      setDetailsLoading(true);
      micrositeService
        .fetchPropertyDetails(propId)
        .then((res) => {
          if (res) {
            setPlotDetailsState((prev) => ({ ...(prev || {}), ...res }));
          }
        })
        .catch((err) => {
          console.warn('[InteractiveMasterPlan] fetchPropertyDetails:', err);
        })
        .finally(() => {
          setDetailsLoading(false);
        });
    }
  }, [selectedPlot, plotDetailsMap]);

  // Status Colors Fallback
  const statusColors = mapData?.status_colors || {
    Available: '#10B981',
    Booked: '#F59E0B',
    'Paid Registration Pending': '#3B82F6',
    Registered: '#64748B',
    Sold: '#64748B',
    Blocked: '#EF4444',
  };

  if (loading && !mapData) {
    return (
      <div className="w-full aspect-[16/9] min-h-[460px] rounded-2xl bg-slate-900 flex flex-col items-center justify-center gap-4 text-white p-6">
        <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-serif text-lg font-bold tracking-wide">Loading 3D Drone Master Plan...</p>
          <p className="text-xs text-slate-400">Rendering Three.js Cadastral Scene & Plot Models</p>
        </div>
      </div>
    );
  }

  if (error || !mapData || !mapData.map) {
    return (
      <div className="relative aspect-[16/9] min-h-[420px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <img
          src={venture.masterPlanImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1600&q=80'}
          alt="Cadastral Blueprint"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-md space-y-3 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <span className="material-symbols-outlined text-4xl text-amber-400">map</span>
          <h3 className="font-serif text-xl font-bold">Interactive Plan Updating</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {error || 'The digital cadastral blueprint is currently being synced with the registry server.'}
          </p>
          <div className="pt-2">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider hover:brightness-110"
            >
              <span>Enquire for Layout PDF</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { map, stats, plots = [] } = mapData;
  const ventureTitle = venture.title || mapData.venture?.name || `Venture #${venture.ventureId || 232}`;
  const selectedPlotColor = selectedPlot
    ? selectedPlot.custom_color || statusColors[selectedPlot.status] || '#10B981'
    : '#10B981';

  return (
    <div
      className={
        isMaxView
          ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-100 text-slate-900 overflow-hidden flex flex-col select-none font-sans'
          : 'relative w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-100 text-slate-900 flex flex-col select-none font-sans'
      }
    >
      {/* 1. FLOATING HEADER (Matches reference code exact day-theme UI) */}
      <header className="relative z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Left: Back button (Exits Max View if active) & Venture Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isMaxView ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMaxView(false)}
              className="h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 cursor-pointer border border-slate-200"
              title="Exit Max View (Esc)"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <Box className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[280px]">
                {ventureTitle}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5 text-emerald-600" /> Interactive Map
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate">
              {map?.title || 'Master Plan • Drag, pan and zoom to inspect plot status & details'}
            </p>
          </div>
        </div>

        {/* Center: Live Stats Summary Badges (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <span className="text-slate-500 text-[11px] font-medium">Plots:</span>
            <span className="font-bold text-slate-900">{stats.total_placed || plots.length}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {stats.available || 0} Avail
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {stats.booked || 0} Booked
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {stats.sold || 0} Sold
            </span>
          </div>
        </div>

        {/* Right Actions: Search + View Mode + Filter Toggle + Max View + Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-28 sm:w-44 md:w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Find Plot #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 pl-8 pr-7 text-xs bg-slate-100/90 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          {/* View Mode Toggle: 3D WebGL vs 2D Plan */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="3D WebGL Scene (Three.js with Smooth Camera Flying)"
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D World</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('2d');
                setIs3DMode(false);
                setPitchAngle(0);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2D Master Plan Blueprint"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2D Plan</span>
            </button>
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFiltersBar(!showFiltersBar)}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border text-xs gap-1.5 transition-all cursor-pointer ${
              isAnyFilterActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {isAnyFilterActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
          </Button>

          {/* Comparison Trigger if plots queued */}
          {comparedPlots.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompareModal(true)}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Compare ({comparedPlots.length})</span>
            </Button>
          )}

          {/* MAX VIEW / FULLSCREEN TOGGLE BUTTON */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaxView(!isMaxView)}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border text-xs gap-1.5 transition-all cursor-pointer ${
              isMaxView
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 font-bold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isMaxView ? 'Exit Max View (Esc)' : 'Maximize to Full View'}
          >
            {isMaxView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isMaxView ? 'Exit Max' : 'Max View'}</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={loadMapData}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
            title="Refresh Map Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* 2. FILTER DROPDOWN / POPOVER BAR (Exact reference day theme) */}
      {showFiltersBar && (
        <div className="relative z-20 bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 py-3 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status:</span>
                <div className="flex items-center flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      selectedStatusFilter === 'ALL'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {availableStatuses.map((st) => {
                    const color = statusColors[st] || '#10b981';
                    const isSelected = selectedStatusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatusFilter(isSelected ? 'ALL' : st)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-bold ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facing Filter */}
              {availableFacings.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Facing:</span>
                  <div className="flex items-center flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedFacingFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        selectedFacingFilter === 'ALL'
                          ? 'bg-sky-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All
                    </button>
                    {availableFacings.map((fc) => {
                      const isSelected = selectedFacingFilter === fc;
                      return (
                        <button
                          key={fc}
                          type="button"
                          onClick={() => setSelectedFacingFilter(isSelected ? 'ALL' : fc)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white font-bold ring-2 ring-sky-400/30'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {fc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Results count & Clear */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-slate-600">
                Matching: <strong className="text-slate-900">{matchedPlotsCount}</strong> of {plots.length} plots
              </span>
              {isAnyFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatusFilter('ALL');
                    setSelectedFacingFilter('ALL');
                  }}
                  className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE CANVAS VIEWPORT (3D Drone WebGL Scene with Three.js or 2D Plan) */}
      <main
        className={
          isMaxView
            ? 'flex-1 w-full h-full relative overflow-hidden bg-slate-100 flex items-center justify-center'
            : 'relative w-full h-[620px] sm:h-[720px] lg:h-[800px] overflow-hidden bg-slate-100 flex items-center justify-center'
        }
      >
        {viewMode === '3d' ? (
          <Venture3DCanvas
            mapData={mapData}
            selectedPlot={selectedPlot}
            plotDetails={plotDetailsState || (selectedPlot ? ((plotDetailsMap[selectedPlot.property_id] || selectedPlot) as any) : null)}
            detailsLoading={detailsLoading}
            onSelectPlot={(p) => setSelectedPlot(p)}
            onClosePlot={() => setSelectedPlot(null)}
            onBookSiteVisit={handleBookSiteVisit}
            onBookPlot={handleBookSiteVisit}
            onWhatsAppShare={handleWhatsAppShare}
            isPlotMatching={isPlotMatching}
            isAnyFilterActive={isAnyFilterActive}
            statusColors={statusColors}
            comparedPlotIds={comparedPlots.map((p) => p.property_id)}
            onToggleCompare={handleToggleCompare}
          />
        ) : (
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.3}
            maxScale={4.5}
            centerOnInit={true}
            smooth={true}
            wheel={{ step: 0.05 }}
            pinch={{ step: 1 }}
            doubleClick={{ mode: 'zoomIn', step: 0.3 }}
            onTransform={(ref) => {
              if (ref?.state?.scale) {
                setZoomScale(ref.state.scale);
              }
            }}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
              <>
                {/* Floating Canvas Controls Dock (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-xl">
                  <button
                    type="button"
                    onClick={() => zoomOut(0.25)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-base">zoom_out</span>
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-indigo-600">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => zoomIn(0.25)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-base">zoom_in</span>
                  </button>
                  <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => centerView(1)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Center Blueprint"
                  >
                    <span className="material-symbols-outlined text-base">fit_screen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetTransform();
                      setIs3DMode(false);
                      setPitchAngle(0);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Reset Orientation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Status Color Legend (Bottom Right) */}
                <div className="hidden md:flex absolute bottom-4 right-4 z-20 items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-[11px] text-slate-800 shadow-xl">
                  {Object.entries(statusColors)
                    .slice(0, 4)
                    .map(([stName, hexColor]) => (
                      <div key={stName} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: hexColor }} />
                        <span className="text-slate-600 font-medium">{stName}</span>
                      </div>
                    ))}
                </div>

                {/* Blueprint & Interactive Plots Canvas */}
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    cursor: 'grab',
                    perspective: is3DMode ? '1400px' : 'none',
                  }}
                  contentStyle={{
                    width: 'auto',
                    height: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    className="relative inline-block select-none will-change-transform transition-all duration-300"
                    style={{
                      transform: is3DMode ? `perspective(1400px) rotateX(${pitchAngle}deg)` : 'none',
                      boxShadow: is3DMode
                        ? '0 35px 70px -15px rgba(0, 0, 0, 0.4)'
                        : '0 10px 30px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* Master Plan Map Image */}
                    <img
                      src={getMapAssetUrl(map.image_url)}
                      alt={map.title || 'Master Layout Plan'}
                      className="block pointer-events-none select-none max-w-none"
                      draggable={false}
                    />

                    {/* Overlaid Interactive Plot Chips */}
                    {plots.map((plot) => {
                      const isMatching = isPlotMatching(plot);
                      const isSelected = selectedPlot?.property_id === plot.property_id;
                      const bg = plot.custom_color || statusColors[plot.status] || '#10B981';

                      return (
                        <button
                          key={plot.property_id || plot.plot_no}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlot(plot);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${plot.x_percent}%`,
                            top: `${plot.y_percent}%`,
                            transform: `translate(-50%, -50%) rotate(${plot.rotation || 0}deg) ${
                              is3DMode ? 'translateZ(14px)' : 'translateZ(0px)'
                            } ${isSelected ? 'scale(1.25)' : 'scale(1)'}`,
                            backgroundColor: bg,
                            color: '#FFFFFF',
                            fontSize: `${plot.font_size || 11}px`,
                            fontWeight: 800,
                            padding: '3px 6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            border: isSelected
                              ? '2px solid #FBBF24'
                              : '1px solid rgba(255, 255, 255, 0.85)',
                            boxShadow: isSelected
                              ? '0 0 0 3px rgba(251, 191, 36, 0.6), 0 10px 20px rgba(0,0,0,0.4)'
                              : '0 2px 6px rgba(0, 0, 0, 0.3)',
                            zIndex: isSelected ? 35 : 10,
                            opacity: isAnyFilterActive && !isMatching ? 0.2 : 1,
                            filter: isAnyFilterActive && !isMatching ? 'grayscale(80%)' : 'none',
                            transition: 'transform 0.15s ease, opacity 0.2s ease',
                          }}
                          className="hover:scale-115 active:scale-95 outline-hidden flex items-center justify-center font-sans tracking-tight"
                          title={`Plot #${plot.plot_no} (${plot.status}) - ${plot.facing || 'East'} Facing`}
                        >
                          <span>{plot.plot_no}</span>
                        </button>
                      );
                    })}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </main>

      {/* 4. LUXURY PLOT SPECIFICATION DRAWER (2D Mode) */}
      {viewMode === '2d' && selectedPlot && (
        <div
          className="fixed inset-0 z-40 flex items-end md:items-center justify-end pointer-events-none p-0 md:p-6"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="pointer-events-auto w-full md:w-[380px] bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 animate-in slide-in-from-bottom-6 md:slide-in-from-right-6 duration-300 max-h-[85vh] md:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-md"
                  style={{ backgroundColor: selectedPlotColor }}
                >
                  {selectedPlot.plot_no}
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Plot #{selectedPlot.plot_no}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedPlot.facing || 'East'} Facing • Premium Residential Unit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleCompare(selectedPlot)}
                  className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                    comparedPlots.some((p) => p.property_id === selectedPlot.property_id)
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={
                    comparedPlots.some((p) => p.property_id === selectedPlot.property_id)
                      ? 'Remove from comparison'
                      : 'Add to comparison'
                  }
                >
                  <Scale className="w-3 h-3" />
                  <span>
                    {comparedPlots.some((p) => p.property_id === selectedPlot.property_id)
                      ? 'In Compare'
                      : 'Compare'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlot(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Specifications Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Status Pill & Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wide border uppercase"
                  style={{
                    backgroundColor: `${selectedPlotColor}15`,
                    borderColor: selectedPlotColor,
                    color: selectedPlotColor,
                  }}
                >
                  {selectedPlot.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
                  Approved Layout
                </span>
              </div>

              {/* 2x2 Specifications Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Plot Architecture & Dimensions
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Dimensions</span>
                    <span className="text-sm font-bold text-slate-900">
                      {plotDetailsState?.dimensions || selectedPlot.dimensions || '30 × 40 ft'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Area Sq.Yards</span>
                    <span className="text-sm font-bold text-slate-900">
                      {plotDetailsState?.srq_yards || plotDetailsState?.sq_yards || selectedPlot.sq_yards || (selectedPlot as any).srq_yards ? `${plotDetailsState?.srq_yards || plotDetailsState?.sq_yards || selectedPlot.sq_yards || (selectedPlot as any).srq_yards} sq.yd` : '133.3 sq.yd'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sft Cost</span>
                    <span className="text-sm font-bold text-slate-900">
                      {plotDetailsState?.sft_cost || (plotDetailsState as any)?.cost_per_sft || selectedPlot.sft_cost
                        ? formatINR(Number(plotDetailsState?.sft_cost || (plotDetailsState as any)?.cost_per_sft || selectedPlot.sft_cost))
                        : '₹1,650 / sft'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Avenue Width</span>
                    <span className="text-sm font-bold text-slate-900">
                      {(() => {
                        const raw = plotDetailsState?.roadsize || selectedPlot.roadsize || '40 ft';
                        const s = String(raw).trim();
                        return s.toLowerCase().includes('ft') || s.toLowerCase().includes('feet') ? s : `${s} ft`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown Card */}
              {selectedPlot.total_cost && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Total Consideration
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-serif text-slate-900">
                      {formatINR(selectedPlot.total_cost)}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Spot Registry Active
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 px-5 bg-slate-50 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handleBookSiteVisit(selectedPlot)}
                style={{ backgroundColor: theme?.accent || '#059669', color: '#FFFFFF' }}
                className="w-full py-3.5 rounded-xl font-sans text-xs font-extrabold uppercase tracking-wider shadow-lg hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                <span>Schedule VIP Site Visit for Plot #{selectedPlot.plot_no}</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppShare(selectedPlot)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                <span>Share Plot via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING MULTI-PLOT COMPARISON DOCK */}
      <PlotComparisonDock
        comparedPlots={comparedPlots}
        statusColors={statusColors}
        onOpenModal={() => setShowCompareModal(true)}
        onRemovePlot={handleRemoveFromCompare}
        onClearAll={handleClearCompare}
        maxPlots={4}
      />

      {/* 6. SIDE-BY-SIDE PLOT COMPARISON MATRIX MODAL */}
      <PlotComparisonMatrixModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        comparedPlots={comparedPlots}
        allPlots={plots}
        plotDetailsMap={plotDetailsMap}
        statusColors={statusColors}
        ventureName={ventureTitle}
        onRemovePlot={handleRemoveFromCompare}
        onAddPlot={handleAddPlotToCompare}
        onClearAll={handleClearCompare}
        onBookSiteVisit={handleBookSiteVisit}
        onBookPlot={handleBookSiteVisit}
        maxPlots={4}
      />
    </div>
  );
}
