export const SITE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://cms.slnmplapp.com/api',
  adminBaseUrl: import.meta.env.VITE_ADMIN_BASE_URL || 'https://admin.slnmplapp.com',
  activeVentureId: import.meta.env.VITE_VENTURE_ID || '232',
  enableOfflineFallback: true,
  themeName: 'shadcn_theme_2',
  themeStyle: 'Architectural Modernist',
};

export const API_ENDPOINTS = {
  getVenturePage: (ventureId: string | number) => `${SITE_CONFIG.apiBaseUrl}/cms/ventures/${ventureId}/page`,
  getInteractiveMap: (ventureId: string | number) => `${SITE_CONFIG.apiBaseUrl}/ventures/${ventureId}/interactive-map`,
  submitInquiry: `${SITE_CONFIG.apiBaseUrl}/cms/leads`,
};

export function getLocationAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleaned = path.replace(/^\/+/, '');
  return `https://cms.slnmplapp.com/core/public/${cleaned}`;
}

export function getMapAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleaned = path.replace(/^\/+/, '');
  return `https://cms.slnmplapp.com/core/public/${cleaned}`;
}
