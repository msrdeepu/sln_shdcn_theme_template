export interface SpecItem {
  value: string;
  label: string;
  sub?: string;
}

export interface AmenityItem {
  id: number;
  title: string;
  icon?: string;
  category?: string;
  desc?: string;
  image?: string;
  iconImage?: string;
  color?: string;
  badge?: string;
}

export interface LocationItem {
  id: number;
  title: string;
  distance: string;
  travelTime?: string;
  group?: string;
  image?: string;
  desc?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WhyChoosePillar {
  num?: string;
  tag: string;
  title: string;
  description: string;
  points: string[];
  icon?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  branchAddress: string;
  whatsapp?: string;
  visitingHours?: string;
  loungeTitle?: string;
  chauffeur?: boolean;
  googleMapsEmbedUrl?: string;
  directionsUrl?: string;
}

export interface MasterPlanLegend {
  label: string;
  dimensions: string;
  availability: string;
  color: string;
}

export interface VentureData {
  id: string;
  ventureId?: number;
  title: string;
  tagline: string;
  location: string;
  address: string;
  reraNumber: string;
  heroBanner: string;
  welcomeEyebrow?: string;
  headline?: string;
  subheadline?: string;
  vimeoId?: string;
  vimeoUrl?: string;
  droneVideoTitle?: string;

  overviewText: string[];
  aboutImage: string;
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutQuote?: string;
  aboutQuoteAuthor?: string;
  aboutChecklist?: string[];

  totalPlots: string;
  roadWidth: string;
  specs: SpecItem[];
  stats: SpecItem[];

  whyChoosePoints: WhyChoosePillar[];
  whyChooseEyebrow?: string;
  whyChooseTitle?: string;
  whyChooseSubtitle?: string;

  amenities: AmenityItem[];
  locations: LocationItem[];

  brochureMockup: string;
  brochureUrl: string;
  brochureTitle?: string;
  brochureDesc?: string;
  brochureFileSize?: string;
  brochureFileName?: string;

  mapEmbedImage: string;

  masterPlanImage?: string;
  masterPlanTitle?: string;
  masterPlanEyebrow?: string;
  masterPlanTotalPlots?: string;
  masterPlanLegends?: MasterPlanLegend[];

  faqs: FaqItem[];
  contact: ContactInfo;

  metaTitle?: string;
  metaDescription?: string;
  seo?: any;
  rawSections?: any;
  chatbotConnectString?: string;
  voicebotConnectString?: string;
  chatbotAgentId?: string;
  voicebotAgentId?: string;
  colorPalette?: {
    presetId: string;
    primary: string;
    accent: string;
    accentHover: string;
    background: string;
    cardBg: string;
    textPrimary: string;
    borderColor: string;
  };
}
