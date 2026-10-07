import { VentureData } from '../types';

/**
 * Dynamically manage and inject all SEO, OpenGraph, Twitter, Canonical, and Schema metadata
 * directly into the browser's <head> based on live CMS venture data.
 */
export function updateDocumentSeo(venture: VentureData | null): void {
  if (typeof document === 'undefined' || !venture) return;

  const seo = venture.seo || {};
  const title =
    seo.metaTitle ||
    venture.metaTitle ||
    seo.ogTitle ||
    `${venture.title} | Luxury Plotted Community`;

  const description =
    seo.metaDescription ||
    venture.metaDescription ||
    seo.ogDescription ||
    venture.tagline ||
    venture.subheadline ||
    '';

  const keywords =
    Array.isArray(seo.focusKeywords) && seo.focusKeywords.length > 0
      ? seo.focusKeywords.join(', ')
      : `${venture.title}, residential plots, approved layout, real estate plots, villa plots`;

  const canonicalUrl =
    seo.canonicalUrl ||
    (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '');

  const robots = seo.robots || 'index, follow';
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || venture.heroBanner || '';
  const ogType = seo.ogType || 'website';
  const ogSiteName = seo.ogSiteName || 'SLN Marketing Private Limited (SLNMPL)';
  const twitterCard = seo.twitterCard || 'summary_large_image';
  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const twitterImage = seo.twitterImage || ogImage;
  const twitterSite = seo.twitterSite || '@SLNGroupIndia';

  // 1. Update Document Title
  document.title = title;

  // Helper to set or create a <meta> tag
  const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper to set or create a <link> tag
  const setLinkTag = (rel: string, href: string) => {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // 2. Standard Search Engine Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'robots', robots);
  setLinkTag('canonical', canonicalUrl);

  // 3. OpenGraph Social Meta Tags
  setMetaTag('property', 'og:title', ogTitle);
  setMetaTag('property', 'og:description', ogDescription);
  setMetaTag('property', 'og:image', ogImage);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:site_name', ogSiteName);

  // 4. Twitter Card Meta Tags
  setMetaTag('name', 'twitter:card', twitterCard);
  setMetaTag('name', 'twitter:title', twitterTitle);
  setMetaTag('name', 'twitter:description', twitterDescription);
  setMetaTag('name', 'twitter:image', twitterImage);
  setMetaTag('name', 'twitter:site', twitterSite);

  // 5. JSON-LD Structured Data Schema Markup
  const schemaId = 'venture-jsonld-schema';
  let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = schemaId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': seo.schemaType || 'RealEstateListing',
    name: venture.title,
    description: description,
    url: canonicalUrl,
    image: ogImage ? [ogImage] : undefined,
    telephone: venture.contact?.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: venture.location,
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN',
      streetAddress: venture.address || venture.contact?.branchAddress || '',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    },
  };

  scriptEl.textContent = JSON.stringify(structuredData, null, 2);
}
