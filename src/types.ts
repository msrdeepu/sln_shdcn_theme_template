export const TYPES_VERSION = '1.0.0';

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
  siteVisitEyebrow?: string;
  siteVisitTitle?: string;
  siteVisitDesc?: string;
  formTitle?: string;
  formSubtitle?: string;
  formButtonText?: string;
}

export interface MasterPlanLegend {
  label: string;
  dimensions: string;
  availability: string;
  color: string;
}

export interface ColorPalette {
  presetId: string;
  primary: string;
  accent: string;
  accentHover?: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  borderColor: string;
}

export interface VentureData {
  id: string;
  slug?: string;
  ventureId?: number;
  title: string;
  tagline: string;
  location: string;
  address: string;
  reraNumber: string;
  heroBanner: string;
  heroBgImage?: string;
  welcomeEyebrow?: string;
  headline?: string;
  subheadline?: string;
  vimeoId?: string;
  vimeoUrl?: string;
  droneVideoTitle?: string;
  droneVideoSubtitle?: string;
  droneVideoDesc?: string;

  overviewText: string[];
  aboutImage: string;
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutQuote?: string;
  aboutQuoteAuthor?: string;
  aboutChecklist?: string[];

  totalPlots: string;
  totalPlotsCount?: number;
  availablePlotsCount?: number;
  roadWidth: string;
  specs: SpecItem[];
  stats: SpecItem[];
  specsTitle?: string;
  specsEyebrow?: string;
  specsSubtitle?: string;

  whyChoosePoints: WhyChoosePillar[];
  whyChooseEyebrow?: string;
  whyChooseTitle?: string;
  whyChooseSubtitle?: string;

  amenities: AmenityItem[];
  amenitiesBgImage?: string;
  amenitiesTitle?: string;
  amenitiesEyebrow?: string;
  amenitiesSubtitle?: string;
  locations: LocationItem[];

  brochureMockup: string;
  brochureUrl: string;
  brochureTitle?: string;
  brochureDesc?: string;
  brochureFileSize?: string;
  brochureFileName?: string;
  brochureCardTitle?: string;
  brochureBtnText?: string;
  brochureItems?: Array<{ label: string; value: string }>;

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
  colorPalette?: ColorPalette;
  footer?: FooterConfig;
  developmentHighlights?: DevelopmentHighlightsConfig;
}

export interface DevelopmentHighlightItem {
  id?: number;
  title: string;
  image?: string;
  description: string;
  desc?: string;
  time?: string;
  dist?: string;
  tag?: string;
}

export interface DevelopmentHighlightsConfig {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  items: DevelopmentHighlightItem[];
}

export interface FooterNavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterSocialLink {
  platform: 'facebook' | 'twitter' | 'google' | 'linkedin' | 'instagram' | 'youtube' | 'whatsapp' | 'rss' | 'email';
  url: string;
}

export interface FooterColumnItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterColumn {
  title?: string;
  items?: FooterColumnItem[];
}

export interface FooterContactDetails {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface FooterConfig {
  // Theme & Colors
  bgColor?: string;
  cardBgColor?: string;
  textColor?: string;
  accentColor?: string;
  bottomTextColor?: string;

  // Map
  showMap?: boolean;
  mapEmbedUrl?: string;

  // Header & Floating Social Badges
  headline?: string;
  socials?: FooterSocialLink[];

  // 4 Columns
  col1?: FooterColumn;
  col2?: FooterColumn;
  col3?: FooterColumn;
  col4?: FooterColumn;
  contactCol?: FooterContactDetails;

  // Copyright & Bottom Links
  showBottomBar?: boolean;
  copyrightText?: string;
  bottomLinks?: FooterColumnItem[];

  // Legacy compatibility fields
  logoUrl?: string;
  logoBg?: string;
  description?: string;
  navTitle?: string;
  navItems?: FooterNavItem[];
  col3Title?: string;
  officeTitle?: string;
  address?: string;
  phone?: string;
  showBackToTop?: boolean;
}
