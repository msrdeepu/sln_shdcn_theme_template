import { SITE_CONFIG, API_ENDPOINTS, getLocationAssetUrl, getMapAssetUrl } from '../siteConfig';
import type { VentureData, AmenityItem, FaqItem } from '../types';
import type { InteractiveMapData } from '../types/interactiveMap';

export function extractConvaiAgentId(connectString?: string | null, fallbackId: string = ''): string {
  if (!connectString || typeof connectString !== 'string') return fallbackId;
  const trimmed = connectString.trim();
  if (!trimmed) return fallbackId;

  const match = trimmed.match(/agent-id=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  const agentMatch = trimmed.match(/agent_[a-zA-Z0-9_-]+/i);
  if (agentMatch && agentMatch[0]) {
    return agentMatch[0].trim();
  }

  const clean = trimmed.replace(/<[^>]*>?/gm, '').trim();
  return clean || fallbackId;
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

export const micrositeService = {
  getVentureId(): string {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVentureId = urlParams.get('id') || urlParams.get('venture_id');
      if (urlVentureId) return urlVentureId;
    }
    return String(SITE_CONFIG.activeVentureId || '232');
  },

  async loadActiveVenture(): Promise<VentureData | null> {
    const ventureId = this.getVentureId();
    try {
      let pageData: any = null;
      try {
        const res = await fetch(API_ENDPOINTS.getVenturePage(ventureId));
        if (res.ok) {
          const json = await res.json();
          if (json.data) pageData = json.data;
        }
      } catch (e) {
        console.warn('[MicrositeService] Fetch page for ventureId failed:', e);
      }

      // If pageData is null, attempt to load published page 241 or from venture-pages listing
      if (!pageData) {
        try {
          const listRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/venture-pages`);
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (Array.isArray(listJson.data) && listJson.data.length > 0) {
              const published = listJson.data.find((p: any) => p.status === 'published') || listJson.data[0];
              if (published?.venture_id) {
                const subRes = await fetch(API_ENDPOINTS.getVenturePage(published.venture_id));
                if (subRes.ok) {
                  const subJson = await subRes.json();
                  if (subJson.data) pageData = subJson.data;
                }
              }
            }
          }
        } catch (e) {
          console.warn('[MicrositeService] Fallback listing fetch failed:', e);
        }
      }

      if (!pageData) return null;
      const ventureData = this.mapToVentureData(pageData);

      // Fetch live master amenities from CMS API and filter strictly to only the selected ones
      try {
        const liveAmenitiesRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/amenities`);
        if (liveAmenitiesRes.ok) {
          const liveJson = await liveAmenitiesRes.json();
          if (liveJson && liveJson.status === 'success' && Array.isArray(liveJson.data)) {
            const masterList: any[] = liveJson.data;

            const rawAmenities = pageData.amenities || pageData.raw_data?.amenities || {};
            const selectedIds: number[] = Array.isArray(rawAmenities.selectedIds)
              ? rawAmenities.selectedIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
              : [];
            const customList: any[] = Array.isArray(rawAmenities.customList) ? rawAmenities.customList : [];

            const masterMap = new Map<number, any>();
            masterList.forEach((m) => {
              if (m.id != null) masterMap.set(Number(m.id), m);
            });

            const dynamicallySelected: AmenityItem[] = [];

            if (selectedIds.length > 0) {
              selectedIds.forEach((id) => {
                const masterItem = masterMap.get(id);
                if (masterItem) {
                  const title = masterItem.title || masterItem.display_name || 'Amenity';
                  dynamicallySelected.push({
                    id,
                    title,
                    icon: masterItem.icon || 'Sparkles',
                    category: resolveAmenityCategory(title, masterItem.category),
                    desc: resolveAmenityDescription(title, masterItem.description),
                    image: getLocationAssetUrl(masterItem.icon_image_url || masterItem.image_url || masterItem.icon_image || masterItem.image),
                    iconImage: getLocationAssetUrl(masterItem.icon_image_url || masterItem.icon_image),
                    color: masterItem.color,
                    badge: masterItem.badge,
                  });
                } else {
                  const customItem = customList.find((c) => Number(c.id) === id);
                  if (customItem) {
                    const title = customItem.title || 'Amenity';
                    dynamicallySelected.push({
                      id,
                      title,
                      icon: customItem.icon || 'Sparkles',
                      category: resolveAmenityCategory(title, customItem.category),
                      desc: customItem.desc || customItem.description || '',
                      image: customItem.image ? getLocationAssetUrl(customItem.image) : '',
                      iconImage: customItem.iconImage ? getLocationAssetUrl(customItem.iconImage) : '',
                    });
                  }
                }
              });
            } else if (customList.length > 0) {
              customList.forEach((c: any) => {
                const cId = Number(c.id);
                const masterItem = masterMap.get(cId);
                const title = c.title || masterItem?.title || 'Amenity';
                dynamicallySelected.push({
                  id: cId,
                  title,
                  icon: masterItem?.icon || c.icon || 'Sparkles',
                  category: resolveAmenityCategory(title, c.category || masterItem?.category),
                  desc: c.desc || masterItem?.description || '',
                  image: c.image ? getLocationAssetUrl(c.image) : '',
                  iconImage: c.iconImage ? getLocationAssetUrl(c.iconImage) : '',
                });
              });
            }

            if (dynamicallySelected.length > 0) {
              ventureData.amenities = dynamicallySelected;
            }
          }
        }
      } catch (err) {
        console.warn('[MicrositeService] Error loading live amenities:', err);
      }

      // Fetch live prime locations from CMS API
      try {
        const vId = pageData.venture_id || ventureId || '232';
        let locRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/venture-locations?venture_id=${vId}`);
        let locJson = locRes.ok ? await locRes.json() : null;

        if (!locJson || !Array.isArray(locJson.data) || locJson.data.length === 0) {
          const fallbackRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/venture-locations`);
          if (fallbackRes.ok) {
            locJson = await fallbackRes.json();
          }
        }

        if (locJson && locJson.status === 'success' && Array.isArray(locJson.data) && locJson.data.length > 0) {
          ventureData.locations = locJson.data.map((n: any, idx: number) => ({
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
        }
      } catch (err) {
        console.warn('[MicrositeService] Error loading live locations:', err);
      }

      // Fetch live property counts (Total Plots & Available Plots) from Property model
      try {
        const vId = pageData.venture_id || ventureId || '232';
        const stats = await this.fetchPropertyStats(vId);
        if (stats) {
          ventureData.totalPlotsCount = stats.total_plots;
          ventureData.availablePlotsCount = stats.available_plots;
          if (stats.total_plots > 0) {
            ventureData.totalPlots = String(stats.total_plots);
          }
        }
      } catch (err) {
        console.warn('[MicrositeService] Error loading property counts:', err);
      }

      return ventureData;
    } catch (err) {
      console.error('[MicrositeService] Fetch failed:', err);
      return null;
    }
  },

  mapToVentureData(page: any): VentureData {
    const formatDistance = (rawDist: any): string => {
      if (!rawDist) return 'Nearby';
      const str = String(rawDist).trim();
      return str.toLowerCase().endsWith('km') ? str : `${str} km`;
    };

    const formatTravelTime = (rawTime: any, rawDist: any): string => {
      if (rawTime) {
        const str = String(rawTime).trim();
        return str.toLowerCase().includes('min') || str.toLowerCase().includes('hr') ? str : `${str} Mins`;
      }
      if (rawDist) {
        const num = parseFloat(String(rawDist).replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          const calculatedMinutes = Math.max(3, Math.round(num * 1.5));
          return `${calculatedMinutes} Mins Drive`;
        }
      }
      return '10 Mins Drive';
    };

    const hero = page.hero || page.raw_data?.hero || {};
    const whyChoose = page.why_choose || page.whyChoose || page.raw_data?.whyChoose || {};
    const specs = page.specs || page.raw_data?.specs || [];
    const about = page.about || page.raw_data?.about || {};
    const amenities = page.amenities || page.raw_data?.amenities || { customList: [] };
    const brochure = page.brochure || page.raw_data?.brochure || {};
    const connectivity = page.connectivity || page.raw_data?.connectivity || {};
    const masterPlan = page.master_plan || page.masterPlan || page.raw_data?.masterPlan || {};
    const faqs = page.faqs || page.raw_data?.faqs || [];
    const concierge = page.concierge || page.raw_data?.concierge || {};
    const ventureRel = page.venture || {};

    const defaultChatbotAgentId = 'agent_5801ky7b7a2ce9prsm6nvbs4vd1y';
    const defaultVoicebotAgentId = 'agent_8301ky7bmb15eyhr96n57zev4a26';

    const rawChatbot =
      page.chatbot_connect_string ||
      page.chatbotConnectString ||
      page.raw_data?.chatbot_connect_string ||
      page.raw_data?.chatbotConnectString ||
      ventureRel.chatbot_connect_string ||
      ventureRel.chatbotConnectString;

    const rawVoicebot =
      page.voicebot_connect_string ||
      page.voicebotConnectString ||
      page.raw_data?.voicebot_connect_string ||
      page.raw_data?.voicebotConnectString ||
      ventureRel.voicebot_connect_string ||
      ventureRel.voicebotConnectString;

    const chatbotAgentId = extractConvaiAgentId(rawChatbot, defaultChatbotAgentId);
    const voicebotAgentId = extractConvaiAgentId(rawVoicebot, defaultVoicebotAgentId);

    const mappedStats = Array.isArray(specs) && specs.length > 0
      ? specs.map((s: any) => ({
          value: s.value || '—',
          label: s.label || '',
          sub: s.sub || '',
        }))
      : [
          { value: '180+', label: 'Master Layout Plots', sub: 'Approved Plan' },
          { value: '40 & 50 Ft', label: 'Heavy-Duty Internal Avenues', sub: 'Asphalt Roads' },
          { value: '100%', label: 'Vaastu Orientation', sub: 'East & North Alignments' },
          { value: '24/7', label: 'Guarded Perimeter', sub: 'CCTV & Boom Barrier' },
          { value: 'Spot Registry', label: 'Clear Legal Ownership', sub: 'Immediate Registration' },
        ];

    const mappedPillars = Array.isArray(whyChoose.pillars) && whyChoose.pillars.length > 0
      ? whyChoose.pillars.map((p: any) => ({
          icon: p.tag === 'Macro Location' ? 'Compass' : p.tag === 'Growth Vector' ? 'TrendingUp' : 'ShieldCheck',
          title: p.title || 'Strategic Enclave Pillar',
          description: p.desc || '',
          tag: p.tag || 'Value Vector',
          points: [],
        }))
      : [
          {
            tag: 'Strategic Nexus',
            title: 'Prime Growth Corridor',
            description: 'Positioned signal-free along major expressways, placing employment hubs and rapid transit corridors within easy access.',
            points: [],
            icon: 'Compass',
          },
          {
            tag: 'Capital Appreciation',
            title: 'High-Yield Investment Potential',
            description: 'Surrounded by rapidly developing commercial and residential infrastructure, driving consistent long-term land appreciation.',
            points: [],
            icon: 'TrendingUp',
          },
          {
            tag: 'Legal Integrity',
            title: '100% Clear Title & Spot Registry',
            description: 'Complete statutory and legal certainty with approved layout certification, verified freehold deeds, and immediate registration.',
            points: [],
            icon: 'ShieldCheck',
          },
        ];

    const rawAmenities = page.amenities || page.raw_data?.amenities || {};
    const selectedIds: number[] = Array.isArray(rawAmenities.selectedIds)
      ? rawAmenities.selectedIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
      : [];
    const customList: any[] = Array.isArray(rawAmenities.customList) ? rawAmenities.customList : [];

    const mappedAmenities: AmenityItem[] = [];
    if (customList.length > 0) {
      customList.forEach((c: any, idx: number) => {
        const cId = c.id != null ? Number(c.id) : idx + 1;
        if (selectedIds.length === 0 || selectedIds.includes(cId)) {
          const title = c.title || c.name || 'Amenity';
          const img = getLocationAssetUrl(c.icon_image_url || c.icon_image || c.iconImage || c.image_url || c.image);
          mappedAmenities.push({
            id: cId,
            title,
            category: resolveAmenityCategory(title, c.category),
            desc: c.desc || c.description || '',
            icon: c.icon || 'Sparkles',
            image: img || undefined,
            iconImage: img || undefined,
          });
        }
      });
    }

    // Default 15 world-class venture amenities matching reference catalog
    const finalAmenities: AmenityItem[] = mappedAmenities.length > 0
      ? mappedAmenities
      : [
          { id: 1, title: 'Grand Entrance Arch', category: 'Architecture' },
          { id: 2, title: 'Underground Electricity Connection', category: 'Utilities' },
          { id: 3, title: 'Avenue Plantation', category: 'Landscape' },
          { id: 4, title: 'Street Lights', category: 'Utilities' },
          { id: 5, title: 'Children Park', category: 'Recreation' },
          { id: 6, title: 'Duplex Villa', category: 'Architecture' },
          { id: 7, title: 'Water Supply to Each Plot', category: 'Utilities' },
          { id: 8, title: 'Compound Wall', category: 'Security' },
          { id: 9, title: '24/7 Security', category: 'Security' },
          { id: 10, title: 'Overhead Water Tank', category: 'Utilities' },
          { id: 11, title: 'Underground Drainage', category: 'Utilities' },
          { id: 12, title: 'Entire Layout as Per Vastu', category: 'Planning' },
          { id: 13, title: 'Clear Title & Spot Registration', category: 'Legal' },
          { id: 14, title: 'Solar Fencing Entire Layout', category: 'Security' },
          { id: 15, title: '40 & 50 Ft Blacktop Roads', category: 'Infrastructure' },
        ];

    const rawLocations = (Array.isArray(page.primeLocations) && page.primeLocations.length > 0)
      ? page.primeLocations
      : (Array.isArray(ventureRel.locations) && ventureRel.locations.length > 0)
      ? ventureRel.locations
      : (Array.isArray(page.locations) && page.locations.length > 0)
      ? page.locations
      : (Array.isArray(connectivity.transitNodes) && connectivity.transitNodes.length > 0)
      ? connectivity.transitNodes
      : null;

    const mappedLocations = Array.isArray(rawLocations) && rawLocations.length > 0
      ? rawLocations.map((n: any, idx: number) => ({
          id: n.id ? Number(n.id) : idx + 1,
          title: n.title || n.landmark || 'Prime Landmark',
          distance: formatDistance(n.distance || n.dist),
          travelTime: formatTravelTime(n.travel_time || n.travelTime || n.time, n.distance || n.dist),
          group: n.group ? String(n.group).trim() : 'Transit Node',
          image: getLocationAssetUrl(n.image_url || n.image) || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
          desc: n.description || n.desc || '',
        }))
      : [
          {
            id: 4,
            title: 'Tirupati International Airport',
            distance: '10 KM',
            travelTime: '15 Mins Drive',
            group: 'AIRPORT',
            image: 'https://cms.slnmplapp.com/core/public/uploads/venture_locations/1790247409_primelocation-1.png',
            desc: 'Tirupati International Airport is a major aviation hub providing convenient air connectivity to leading cities across India and supporting easy access to Tirupati and nearby regions.'
          },
          {
            id: 5,
            title: 'TCL',
            distance: '8 KM',
            travelTime: '12 Mins Drive',
            group: 'Manufacturing Hub',
            image: 'https://cms.slnmplapp.com/core/public/uploads/venture_locations/1790247422_primelocation-2.png',
            desc: 'TCL is a major industrial and manufacturing facility in the Sri City region, contributing to local employment, economic growth, and industrial development.'
          },
          {
            id: 6,
            title: 'Srikalahasti Temple',
            distance: '15 KM',
            travelTime: '20 Mins Drive',
            group: 'Famous Temple Town',
            image: 'https://cms.slnmplapp.com/core/public/uploads/venture_locations/1790247438_primelocation-3.png',
            desc: 'Srikalahasti Temple is a renowned ancient Hindu temple dedicated to Lord Shiva, celebrated for its spiritual significance, historic architecture, and association with the sacred Vayu Lingam.'
          },
          {
            id: 7,
            title: 'Yerpedu',
            distance: '5 KM',
            travelTime: '8 Mins Drive',
            group: 'Town',
            image: 'https://cms.slnmplapp.com/core/public/uploads/venture_locations/1790247455_primelocation-4.png',
            desc: 'Yerpedu is a developing town near Tirupati, known for its strategic location, good road connectivity, nearby industries, educational institutions, and growing residential potential.'
          }
        ];

    const mappedFaqs: FaqItem[] = Array.isArray(faqs) && faqs.length > 0
      ? faqs.map((f: any) => ({
          question: f.q || f.question || '',
          answer: f.a || f.answer || '',
        }))
      : [
          { question: 'Is the layout statutory approved and legally certified?', answer: 'Yes, the layout is certified and approved by competent town planning authorities with 100% title scrutiny and clear legal ownership.' },
          { question: 'Are plot buyers eligible for immediate spot registration?', answer: 'Yes, plots possess individual title clearance allowing immediate spot registration upon statutory documentation.' },
          { question: 'Which financial institutions offer pre-approved home/plot loans?', answer: 'Pre-approved loan facilities are active with premier banks including State Bank of India (SBI), HDFC Bank, ICICI Bank, and leading nationalized lenders.' },
          { question: 'What road dimensions and utility infrastructures are implemented?', answer: 'The layout features 40 & 50 feet wide asphalt blacktop avenues, concealed underground drainage, transformer electrification, and 24/7 guarded security.' },
        ];

    const rawParagraphs: string[] = Array.isArray(about.paragraphs) && about.paragraphs.length > 0
      ? about.paragraphs
      : [
          page.tagline || hero.subheadline || 'A premier master-planned plotted layout engineered for generational wealth and elevated living.',
          'Designed with broad asphalt avenues, underground utilities, and clear legal title certainty.'
        ];

    const overviewParagraphs = rawParagraphs.filter(
      (p: string) => p && !/SLN Highlands/i.test(p) && !/Highlands/i.test(p)
    );

    return {
      id: String(page.slug || page.id),
      ventureId: page.venture_id,
      title: page.title || ventureRel.title || 'SLN Venture',
      tagline: page.tagline || hero.subheadline || '',
      location: hero.locationText || ventureRel.location || 'Prime Growth Corridor',
      address: concierge.officeAddress || ventureRel.location || '',
      reraNumber: hero.reraNumber || 'Applied & Compliant',
      heroBanner: hero.heroBannerUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      heroBgImage: hero.heroBgImageUrl || hero.bgImageUrl || hero.heroCoverImageUrl || '',
      welcomeEyebrow: hero.welcomeEyebrow != null ? String(hero.welcomeEyebrow).trim() : '',
      headline: hero.headline || page.title,
      subheadline: hero.subheadline || page.tagline,
      vimeoId: (() => {
        const raw = hero.vimeoId || hero.videoUrl || ventureRel.venture_vimeo_id;
        return raw && String(raw).trim() ? String(raw).trim() : undefined;
      })(),
      vimeoUrl: (() => {
        const raw = hero.videoUrl || (hero.vimeoId ? `https://player.vimeo.com/video/${hero.vimeoId}` : null) || (ventureRel.venture_vimeo_id ? `https://player.vimeo.com/video/${ventureRel.venture_vimeo_id}` : null);
        return raw && String(raw).trim() ? String(raw).trim() : undefined;
      })(),
      droneVideoTitle:
        hero.videoTitle ||
        hero.droneVideoTitle ||
        page.videoTitle ||
        page.raw_data?.hero?.videoTitle ||
        'Cinematic Master Tour From Above',
      droneVideoSubtitle:
        hero.videoDescription ||
        hero.videoSubtitle ||
        hero.droneVideoSubtitle ||
        hero.droneVideoDesc ||
        page.videoDescription ||
        page.raw_data?.hero?.videoDescription ||
        "Experience an ultra-high-definition bird's-eye perspective capturing the sweeping 40 & 50 ft blacktop avenues, verdant open green lungs, and strategic growth corridor connectivity.",

      overviewText: overviewParagraphs,
      aboutImage: about.sitePhotoUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
      aboutEyebrow: about.eyebrow || 'Architectural Vision',
      aboutTitle: about.title || 'Master-Planned Enclave Conceived for Modern Living & Capital Wealth',
      aboutQuote: about.quoteText || `"${page.title} offers uncompromising legal title certainty, immediate spot registry, and rapid capital appreciation."`,
      aboutQuoteAuthor: about.quoteAuthor || '— SLN Group Principal Architecture & Engineering Desk',
      aboutChecklist: Array.isArray(about.checklist) ? about.checklist : [],

      totalPlots: (() => {
        const plotSpec = Array.isArray(specs) ? specs.find((s: any) => /plot/i.test(s.label || s.sub || '')) : null;
        return plotSpec?.value || masterPlan.totalPlotsCount || '175';
      })(),
      roadWidth: (() => {
        const roadSpec = Array.isArray(specs) ? specs.find((s: any) => /road|width|avenue|bt/i.test(s.label || s.sub || '')) : null;
        const val = roadSpec?.value || '40 & 50 Feet';
        return String(val) === '10' ? '40 & 50 Feet' : val;
      })(),
      specs: mappedStats,
      stats: mappedStats,
      specsTitle: (() => {
        const t = page.specsTitle ?? page.specs_title ?? page.raw_data?.specsTitle ?? page.raw_data?.specs_title ?? (page.specs && typeof page.specs === 'object' && !Array.isArray(page.specs) ? page.specs.sectionTitle : null);
        return t ? String(t).trim() : '';
      })(),
      specsEyebrow: (() => {
        const e = page.specsEyebrow ?? page.specs_eyebrow ?? page.raw_data?.specsEyebrow ?? page.raw_data?.specs_eyebrow ?? (page.specs && typeof page.specs === 'object' && !Array.isArray(page.specs) ? page.specs.sectionEyebrow : null);
        return e ? String(e).trim() : '';
      })(),
      specsSubtitle: (() => {
        const s = page.specsSubtitle ?? page.specs_subtitle ?? page.raw_data?.specsSubtitle ?? page.raw_data?.specs_subtitle ?? (page.specs && typeof page.specs === 'object' && !Array.isArray(page.specs) ? page.specs.sectionSubtitle : null);
        return s ? String(s).trim() : '';
      })(),

      whyChoosePoints: mappedPillars,
      whyChooseTitle:
        whyChoose.sectionTitle ||
        page.whyChooseTitle ||
        page.why_choose_title ||
        page.raw_data?.whyChoose?.sectionTitle ||
        'An Unrivalled Convergence of Connectivity, Economy & Legal Security',
      whyChooseSubtitle: (() => {
        const rawSub =
          whyChoose.sectionSubtitle ||
          page.whyChooseSubtitle ||
          page.why_choose_subtitle ||
          page.raw_data?.whyChoose?.sectionSubtitle ||
          '';
        const vTitle = page.title || ventureRel.name || 'this venture';
        return rawSub
          .replace(/SLN Highlands/gi, vTitle)
          .replace(/Highlands/gi, vTitle);
      })(),

      amenities: finalAmenities,
      amenitiesBgImage: page.amenities?.bgImageUrl || page.amenitiesBgImage || (page.raw_data?.amenities?.bgImageUrl) || '/amenities_clubhouse_bg.jpg',
      amenitiesTitle: page.amenities?.sectionTitle || page.amenitiesTitle || (page.raw_data?.amenities?.sectionTitle) || 'Premium Plots With World Class Amenities',
      amenitiesEyebrow: page.amenities?.sectionEyebrow || page.amenitiesEyebrow || (page.raw_data?.amenities?.sectionEyebrow) || 'World-Class Infrastructure',
      amenitiesSubtitle: page.amenities?.sectionSubtitle || page.raw_data?.amenities?.sectionSubtitle || '',
      locations: mappedLocations,

      brochureMockup: brochure.coverPreviewUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      brochureUrl: brochure.pdfUrl || '#download-brochure',
      brochureTitle: brochure.title || 'Farmland Near Hyderabad With Easy Access',
      brochureDesc: brochure.description || 'Sahaja Nature Lake is at Aroor, Sadashivpet, approximately 5 km off Mumbai Highway.',
      brochureFileSize: brochure.fileSizeLabel || 'PDF • 8.4 MB',
      brochureFileName: brochure.fileName || `${page.slug || 'venture'}-dossier.pdf`,
      brochureCardTitle: brochure.cardTitle || 'PROJECT LOCATION',
      brochureBtnText: brochure.btnText || 'Get Route & Site Visit Details',
      brochureItems: Array.isArray(brochure.items) && brochure.items.length > 0
        ? brochure.items
        : [
            { label: 'Project', value: page.title || ventureRel.title || ventureRel.name || 'Sahaja Nature Lake' },
            { label: 'Location', value: hero.locationText || ventureRel.location || 'Aroor, Sadashivpet' },
            { label: 'Highway', value: '5 km off Mumbai Highway' },
            { label: 'Road', value: 'Mominpet–Budhera Road' },
          ],

      mapEmbedImage: connectivity.mapEmbedUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',

      masterPlanImage: masterPlan.blueprintImageUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      masterPlanTitle: masterPlan.title || 'Master Layout & Plot Cadastre',
      masterPlanEyebrow: masterPlan.eyebrow || 'Master Layout Plan',
      masterPlanTotalPlots: masterPlan.totalPlotsCount || '180+',
      masterPlanLegends: Array.isArray(masterPlan.legends) ? masterPlan.legends : [],

      faqs: mappedFaqs,

      contact: {
        phone: concierge.directSalesPhone ? String(concierge.directSalesPhone).trim() : (hero.salesPhone && hero.salesPhone !== '+91 98480 12345' ? String(hero.salesPhone).trim() : ''),
        email: 'invest@slngroup.in',
        branchAddress: concierge.officeAddress || ventureRel.location || 'Corridor Enclave Site Office',
        whatsapp: concierge.whatsappNumber || '',
        visitingHours: concierge.visitingHours || 'Monday - Sunday: 8:30 AM - 6:30 PM',
        loungeTitle: concierge.loungeTitle || 'Site Office & Experience Center',
        chauffeur: Boolean(concierge.complimentaryChauffeur),
        googleMapsEmbedUrl: (() => {
          const raw = concierge.googleMapsEmbedUrl || concierge.mapEmbedUrl;
          if (raw) {
            const match = String(raw).match(/src=["']([^"']+)["']/i);
            return match ? match[1] : String(raw).trim();
          }
          return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31050.15024419996!2d80.005085!3d13.585526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d81232870197d%3A0xb35a0cfb247f082e!2sTada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000';
        })(),
        directionsUrl: concierge.googleMapsDirectionsUrl || concierge.directionsUrl || 'https://maps.app.goo.gl/ccX7VBApuJTJGqKHA',
        siteVisitEyebrow: concierge.siteVisitEyebrow !== undefined ? concierge.siteVisitEyebrow : 'SITE VISIT',
        siteVisitTitle: concierge.siteVisitTitle !== undefined ? concierge.siteVisitTitle : 'Plan Your Site Visit',
        siteVisitDesc: concierge.siteVisitDesc !== undefined ? concierge.siteVisitDesc : 'Visit the venture in person to explore available plots, walk through the layout, and discuss your plans with our friendly team.',
        formTitle: concierge.formTitle !== undefined ? concierge.formTitle : 'Book a Free Site Visit',
        formSubtitle: concierge.formSubtitle !== undefined ? concierge.formSubtitle : 'Share your details and our team will get in touch to coordinate your visit.',
        formButtonText: concierge.formButtonText !== undefined ? concierge.formButtonText : 'Book Free Site Visit',
      },

      seo: {
        ...(page.raw_data?.seo || {}),
        ...(page.seo || {}),
        metaTitle: page.meta_title || page.raw_data?.metaTitle || page.seo?.ogTitle || page.title,
        metaDescription: page.meta_description || page.raw_data?.metaDescription || page.seo?.ogDescription || page.tagline || hero.subheadline,
      },
      metaTitle: page.meta_title || page.raw_data?.metaTitle || page.seo?.ogTitle || page.title,
      metaDescription: page.meta_description || page.raw_data?.metaDescription || page.seo?.ogDescription || page.tagline || hero.subheadline,
      rawSections: page,
      chatbotConnectString: rawChatbot || '',
      voicebotConnectString: rawVoicebot || '',
      chatbotAgentId,
      voicebotAgentId,
      colorPalette: page.color_palette || page.raw_data?.colorPalette || undefined,
      footer: (() => {
        const f = page.footer || page.raw_data?.footer || {};

        // Colors: Default to reference image red #c9082a, avoiding legacy dark default #090d16
        const resolvedBgColor = (f.bgColor && f.bgColor !== '#090d16') ? f.bgColor : '#c9082a';
        const resolvedCardBgColor = f.cardBgColor || '#ffffff';
        const resolvedAccentColor = (f.accentColor && f.accentColor !== '#c5a880') ? f.accentColor : '#c9082a';
        const resolvedTextColor = f.textColor || '#1e293b';

        // Google Map embed
        const rawMap = f.mapEmbedUrl || f.map_embed_url || concierge.googleMapsEmbedUrl || concierge.mapEmbedUrl ||
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31050.15024419996!2d80.005085!3d13.585526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d81232870197d%3A0xb35a0cfb247f082e!2sTada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000';
        let mapEmbedUrl = '';
        if (rawMap) {
          const match = String(rawMap).match(/src=["']([^"']+)["']/i);
          mapEmbedUrl = match ? match[1] : String(rawMap).trim();
        }

        // Headline: if defined by user (even empty string), respect it. If undefined, default to reference image "Let's Connect"
        const headline = f.headline !== undefined ? f.headline : "Let's Connect";

        // Socials: if array defined by user, filter valid URLs. If undefined, default to the 5 reference platforms
        const socials = Array.isArray(f.socials)
          ? f.socials.filter((s: any) => s && s.url && String(s.url).trim().length > 0)
          : [
              { platform: 'facebook', url: 'https://facebook.com' },
              { platform: 'twitter', url: 'https://twitter.com' },
              { platform: 'google', url: 'https://google.com' },
              { platform: 'linkedin', url: 'https://linkedin.com' },
              { platform: 'rss', url: 'https://rss.com' },
            ];

        // 4 Columns: if defined by user, respect it. If undefined, default to reference image columns
        const col1 = f.col1 !== undefined ? f.col1 : {
          title: 'Services',
          items: [
            { label: 'Web Design', href: '#' },
            { label: 'Development', href: '#' },
            { label: 'Graphic Design', href: '#' },
            { label: 'Branding', href: '#' },
          ],
        };

        const col2 = f.col2 !== undefined ? f.col2 : {
          title: 'Company',
          items: [
            { label: 'About Us', href: '#' },
            { label: 'Story', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Contact Us', href: '#' },
          ],
        };

        const col3 = f.col3 !== undefined ? f.col3 : {
          title: 'Links',
          items: [
            { label: 'Company', href: '#' },
            { label: 'Products', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Portfolio', href: '#' },
          ],
        };

        const col4 = f.col4 !== undefined ? f.col4 : (
          f.contactCol !== undefined ? {
            title: f.contactCol.title || 'Get in Touch',
            items: [
              ...(f.contactCol.email ? [{ label: f.contactCol.email, href: `mailto:${f.contactCol.email}` }] : []),
              ...(f.contactCol.phone ? [{ label: f.contactCol.phone, href: `tel:${f.contactCol.phone}` }] : []),
              ...(f.contactCol.address ? [{ label: f.contactCol.address.split('\n')[0] || f.contactCol.address, href: '#' }] : []),
            ],
          } : {
            title: 'Get in Touch',
            items: [
              { label: 'support@website.com', href: 'mailto:support@website.com' },
              { label: '123 456 789', href: 'tel:123456789' },
              { label: 'Office Location', href: '#contact' },
              { label: 'Customer Support', href: '#' },
            ],
          }
        );

        return {
          ...f,
          bgColor: resolvedBgColor,
          cardBgColor: resolvedCardBgColor,
          textColor: resolvedTextColor,
          accentColor: resolvedAccentColor,
          bottomTextColor: f.bottomTextColor || '#ffffff',

          showMap: f.showMap !== undefined ? Boolean(f.showMap) : true,
          mapEmbedUrl,

          headline,
          socials,

          col1,
          col2,
          col3,
          col4,

          showBottomBar: f.showBottomBar !== undefined ? Boolean(f.showBottomBar) : false,
          copyrightText: f.copyrightText !== undefined ? f.copyrightText : '',
          bottomLinks: Array.isArray(f.bottomLinks) ? f.bottomLinks : undefined,

          logoUrl: f.logoUrl || f.logo_url || '',
          logoBg: f.logoBg || f.logo_bg || '#ffffff',
          description: f.description || '',
          navTitle: f.navTitle || f.nav_title || '',
          navItems: Array.isArray(f.navItems) ? f.navItems : undefined,
          col3Title: f.col3Title || f.col3_title || '',
          officeTitle: f.officeTitle || f.office_title || concierge.loungeTitle || '',
          address: f.address || concierge.officeAddress || '',
          phone: f.phone || concierge.directSalesPhone || '',
          showBackToTop: f.showBackToTop !== false,
        };
      })(),
      developmentHighlights: (() => {
        const rawConn = page.connectivity || page.raw_data?.connectivity;
        if (!rawConn) {
          return {
            title: '',
            eyebrow: '',
            subtitle: '',
            items: [],
          };
        }

        const rawNodes = Array.isArray(rawConn.transitNodes) ? rawConn.transitNodes : [];
        const items = rawNodes.map((n: any, idx: number) => {
          const rawImg = (n.image || n.image_url || '').trim();
          const resolvedImg = rawImg ? getLocationAssetUrl(rawImg) : '';
          return {
            id: n.id ? Number(n.id) : idx + 1,
            title: n.title || '',
            image: resolvedImg,
            description: n.description || n.desc || '',
            desc: n.description || n.desc || '',
            time: n.time || '',
            dist: n.dist || '',
          };
        });

        const rawTitle = rawConn.title ? String(rawConn.title).trim() : '';
        const cleanTitle =
          rawTitle === 'A Connected Nexus Between Urban Chennai & Sri City Hub'
            ? 'Development Highlights'
            : rawTitle;

        return {
          title: cleanTitle,
          eyebrow: rawConn.eyebrow || '',
          subtitle: rawConn.subtitle || '',
          items, // Strictly what exists in backend. No fallback dummy items!
        };
      })(),
    };
  },

  /**
   * Fetch interactive master plan map data (plots, layout image, coordinates, status)
   * Fetches strictly from CMS domain (cms.slnmplapp.com)
   */
  async fetchInteractiveMap(ventureId?: string | number): Promise<InteractiveMapData | null> {
    let id = ventureId || this.getVentureId() || SITE_CONFIG.activeVentureId;
    if (typeof id === 'string' && !/^\d+$/.test(id)) {
      id = SITE_CONFIG.activeVentureId;
    }
    const baseUrl = SITE_CONFIG.apiBaseUrl.replace(/\/+$/, '');

    // Endpoints strictly querying CMS subdomain
    const endpoints = [
      `${baseUrl}/ventures/${id}/interactive-map`,
      `${baseUrl}/cms/ventures/${id}/interactive-map`,
      `https://cms.slnmplapp.com/api/ventures/${id}/interactive-map`,
      `https://cms.slnmplapp.com/api/cms/ventures/${id}/interactive-map`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json && (json.success || json.status === 'success') && json.data) {
            const mapPayload: InteractiveMapData = json.data;
            if (mapPayload.map && mapPayload.map.image_url) {
              mapPayload.map.image_url = getMapAssetUrl(mapPayload.map.image_url);
            }
            return mapPayload;
          }
        }
      } catch (e) {
        // Continue to next endpoint
      }
    }

    return null;
  },

  /**
   * Fetch full live specifications for an individual property/plot
   * Strictly queries CMS endpoints
   */
  async fetchPropertyDetails(propertyId: number | string): Promise<any | null> {
    if (!propertyId) return null;
    const baseUrl = SITE_CONFIG.apiBaseUrl.replace(/\/+$/, '');

    const endpoints = [
      `${baseUrl}/cms/property-details/${propertyId}`,
      `${baseUrl}/ventures/property-details/${propertyId}`,
      `${baseUrl}/property-details/${propertyId}`,
      `https://cms.slnmplapp.com/api/cms/property-details/${propertyId}`,
      `https://cms.slnmplapp.com/api/ventures/property-details/${propertyId}`,
      `https://cms.slnmplapp.com/api/property-details/${propertyId}`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json && (json.success || json.status === 'success') && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        // Continue to next fallback endpoint
      }
    }

    return null;
  },

  /**
   * Fetch live property counts (Total Plots & Available Plots) for a venture
   */
  async fetchPropertyStats(ventureId: string | number): Promise<{ total_plots: number; available_plots: number } | null> {
    if (!ventureId) return null;
    const baseUrl = SITE_CONFIG.apiBaseUrl.replace(/\/+$/, '');

    // 1. Try dedicated property-stats endpoints
    const statsEndpoints = [
      `${baseUrl}/ventures/${ventureId}/property-stats`,
      `${baseUrl}/cms/ventures/${ventureId}/property-stats`,
      `https://cms.slnmplapp.com/api/ventures/${ventureId}/property-stats`,
      `https://cms.slnmplapp.com/api/cms/ventures/${ventureId}/property-stats`,
    ];

    for (const url of statsEndpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json && (json.status === 'success' || json.data) && json.data) {
            const data = json.data;
            if (typeof data.total_plots === 'number') {
              return {
                total_plots: data.total_plots,
                available_plots: data.available_plots ?? 0,
              };
            }
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    // 2. Query interactive-map which queries Property model directly
    try {
      const mapData = await this.fetchInteractiveMap(ventureId);
      if (mapData && Array.isArray(mapData.plots)) {
        const total = mapData.plots.length;
        const available = mapData.plots.filter(
          (p: any) => String(p.status || '').toLowerCase() === 'available'
        ).length;
        return {
          total_plots: total,
          available_plots: available,
        };
      }
    } catch (e) {
      console.warn('[MicrositeService] Error calculating property counts from map:', e);
    }

    return null;
  }
};

