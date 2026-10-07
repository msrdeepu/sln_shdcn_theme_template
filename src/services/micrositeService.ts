import { SITE_CONFIG, API_ENDPOINTS, getLocationAssetUrl, getMapAssetUrl } from '../siteConfig';
import { VentureData, AmenityItem, FaqItem } from '../types';
import { InteractiveMapData } from '../types/interactiveMap';

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

      // Fetch live master amenities from CMS API
      try {
        const liveAmenitiesRes = await fetch(`${SITE_CONFIG.apiBaseUrl}/cms/amenities`);
        if (liveAmenitiesRes.ok) {
          const liveJson = await liveAmenitiesRes.json();
          if (liveJson && liveJson.status === 'success' && Array.isArray(liveJson.data) && liveJson.data.length > 0) {
            ventureData.amenities = liveJson.data.map((a: any, idx: number) => {
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
          points: Array.isArray(p.points) ? p.points : [],
        }))
      : [
          {
            tag: 'Strategic Nexus',
            title: 'Tada-Sri City Growth Gateway',
            description: 'Positioned signal-free along the NH-16 arterial expressway, placing Fortune-500 industrial hubs and express transit within minutes.',
            points: [
              '5 Mins to Tada Railway Junction',
              'Direct signal-free 6-lane artery to North Chennai',
              'Adjacent to international industrial logistics corridor'
            ],
            icon: 'Compass'
          },
          {
            tag: 'Capital Appreciation',
            title: 'High-Yield Industrial Synergy',
            description: 'Flanked by Sri City SEZ housing 220+ global conglomerates with over 65,000 corporate professionals driving relentless land appreciation.',
            points: [
              'Demonstrated 18–24% historic annual land appreciation',
              'Expanding educational campuses & tertiary healthcare hubs',
              'Sustained corporate housing rental demand'
            ],
            icon: 'TrendingUp'
          },
          {
            tag: 'Legal Integrity',
            title: '100% Clear Title & Spot Registry',
            description: 'Complete statutory and legal certainty with sanctioned layout certification, verified titles, and pre-approved national bank loans.',
            points: [
              'Immediate spot registration upon plot allocation',
              'Pre-approved mortgage assistance: SBI, HDFC, ICICI',
              'Unencumbered freehold ownership deed'
            ],
            icon: 'ShieldCheck'
          }
        ];

    const mappedAmenities: AmenityItem[] = [
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

    const overviewParagraphs = Array.isArray(about.paragraphs) && about.paragraphs.length > 0
      ? about.paragraphs
      : [
          page.tagline || hero.subheadline || 'A premier master-planned plotted layout engineered for generational wealth and elevated living.',
          'Designed with broad asphalt avenues, underground utilities, and clear legal title certainty.'
        ];

    return {
      id: String(page.slug || page.id),
      ventureId: page.venture_id,
      title: page.title || ventureRel.title || 'SLN Venture',
      tagline: page.tagline || hero.subheadline || '',
      location: hero.locationText || ventureRel.location || 'Prime Growth Corridor',
      address: concierge.officeAddress || ventureRel.location || '',
      reraNumber: hero.reraNumber || 'Applied & Compliant',
      heroBanner: hero.heroBannerUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      welcomeEyebrow: hero.welcomeEyebrow != null ? String(hero.welcomeEyebrow).trim() : '',
      headline: hero.headline || page.title,
      subheadline: hero.subheadline || page.tagline,
      vimeoId: (hero.vimeoId || hero.videoUrl || ventureRel.venture_vimeo_id) ? String(hero.vimeoId || hero.videoUrl || ventureRel.venture_vimeo_id).trim() : '',
      vimeoUrl: hero.videoUrl || (hero.vimeoId ? `https://player.vimeo.com/video/${hero.vimeoId}` : ''),
      droneVideoTitle: (hero.vimeoId || hero.videoUrl || ventureRel.venture_vimeo_id) ? `${page.title} — 4K Cinematic Aerial Walkthrough` : '',

      overviewText: overviewParagraphs,
      aboutImage: about.sitePhotoUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
      aboutEyebrow: about.eyebrow || 'Architectural Vision',
      aboutTitle: about.title || 'Master-Planned Enclave Conceived for Modern Living & Capital Wealth',
      aboutQuote: about.quoteText || `"${page.title} offers uncompromising legal title certainty, immediate spot registry, and rapid capital appreciation."`,
      aboutQuoteAuthor: about.quoteAuthor || '— SLN Group Principal Architecture & Engineering Desk',
      aboutChecklist: Array.isArray(about.checklist) ? about.checklist : [],

      totalPlots: specs[0]?.value || masterPlan.totalPlotsCount || '175',
      roadWidth: (() => {
        const roadSpec = Array.isArray(specs) ? specs.find((s: any) => /road|width|avenue|bt/i.test(s.label || s.sub || '')) : null;
        const val = roadSpec?.value || specs[1]?.value || '40 & 50 Feet';
        return String(val) === '10' ? '40 & 50 Feet' : val;
      })(),
      specs: mappedStats,
      stats: mappedStats,

      whyChoosePoints: mappedPillars,
      whyChooseEyebrow: whyChoose.sectionEyebrow || 'Strategic Value Proposition',
      whyChooseTitle: whyChoose.sectionTitle || 'Engineered for Generational Growth & Title Certainty',
      whyChooseSubtitle: whyChoose.sectionSubtitle || '',

      amenities: mappedAmenities,
      locations: mappedLocations,

      brochureMockup: brochure.coverPreviewUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      brochureUrl: brochure.pdfUrl || '#download-brochure',
      brochureTitle: brochure.title || 'Private Investment Dossier & Master Cadastral Kit',
      brochureDesc: brochure.description || 'Download verified legal title opinions, master layout blueprints, and plot availability schedule.',
      brochureFileSize: brochure.fileSizeLabel || 'PDF • 8.4 MB',
      brochureFileName: brochure.fileName || `${page.slug || 'venture'}-dossier.pdf`,

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
  }
};

