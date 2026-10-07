import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function dynamicCmsSeoPlugin(env: Record<string, string>) {
  return {
    name: 'dynamic-cms-seo',
    async transformIndexHtml(html: string) {
      try {
        const ventureId = env.VITE_VENTURE_ID || process.env.VITE_VENTURE_ID || '232';
        const apiBase = env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://cms.slnmplapp.com/api';

        const res = await fetch(`${apiBase}/cms/ventures/${ventureId}/page`);
        if (!res.ok) return html;
        const json = (await res.json()) as any;
        const p = json?.data || json;
        if (!p) return html;

        const seo = p.seo || p.raw_data?.seo || {};
        const title =
          p.meta_title ||
          p.raw_data?.metaTitle ||
          seo.ogTitle ||
          `${p.title || 'Venture'} | Luxury Architectural Plotted Enclave`;
        const description =
          p.meta_description ||
          p.raw_data?.metaDescription ||
          seo.ogDescription ||
          p.tagline ||
          '';
        const keywords =
          Array.isArray(seo.focusKeywords) && seo.focusKeywords.length > 0
            ? seo.focusKeywords.join(', ')
            : `${p.title || 'SLN'}, residential plots, approved layout, real estate plots, shadcn theme`;
        const canonicalUrl = seo.canonicalUrl || 'https://slngroup.in';
        const robots = seo.robots || 'index, follow';
        const ogTitle = seo.ogTitle || title;
        const ogDescription = seo.ogDescription || description;
        const ogImage = seo.ogImage || p.hero?.heroBannerUrl || '';
        const ogType = seo.ogType || 'website';
        const ogSiteName = seo.ogSiteName || 'SLN Group Official Portal';
        const twitterCard = seo.twitterCard || 'summary_large_image';
        const twitterTitle = seo.twitterTitle || ogTitle;
        const twitterDescription = seo.twitterDescription || ogDescription;
        const twitterImage = seo.twitterImage || ogImage;
        const twitterSite = seo.twitterSite || '@SLNGroupIndia';

        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': seo.schemaType || 'RealEstateListing',
          name: p.title,
          description: description,
          url: canonicalUrl,
          image: ogImage ? [ogImage] : undefined,
          telephone: p.concierge?.directSalesPhone || (p.hero?.salesPhone && p.hero.salesPhone !== '+91 98480 12345' ? p.hero.salesPhone : undefined),
          address: {
            '@type': 'PostalAddress',
            addressLocality: p.hero?.locationText || p.venture?.location || 'Andhra Pradesh',
            addressRegion: 'Andhra Pradesh',
            addressCountry: 'IN',
          },
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            businessFunction: 'http://purl.org/goodrelations/v1#Sell',
          },
        };

        const tagsToInject = `
    <!-- Primary Dynamic SEO Meta Tags -->
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="keywords" content="${escapeAttr(keywords)}" />
    <meta name="robots" content="${escapeAttr(robots)}" />
    <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeAttr(ogType)}" />
    <meta property="og:site_name" content="${escapeAttr(ogSiteName)}" />
    <meta property="og:title" content="${escapeAttr(ogTitle)}" />
    <meta property="og:description" content="${escapeAttr(ogDescription)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta property="og:url" content="${escapeAttr(canonicalUrl)}" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="${escapeAttr(twitterCard)}" />
    <meta name="twitter:title" content="${escapeAttr(twitterTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(twitterDescription)}" />
    <meta name="twitter:image" content="${escapeAttr(twitterImage)}" />
    <meta name="twitter:site" content="${escapeAttr(twitterSite)}" />

    <!-- Structured Data JSON-LD Schema Markup -->
    <script id="venture-jsonld-schema" type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>`;

        let modified = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
        modified = modified.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '');
        modified = modified.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '');
        modified = modified.replace('</head>', `${tagsToInject}\n  </head>`);
        return modified;
      } catch (e) {
        console.warn('[dynamicCmsSeoPlugin] Note: Could not fetch CMS SEO:', e);
        return html;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      dynamicCmsSeoPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 3002,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'https://cms.slnmplapp.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
        },
      },
    },
  };
});
