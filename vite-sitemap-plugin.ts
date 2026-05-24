import type { Plugin } from 'vite';

interface SitemapPluginOptions {
  baseUrl: string;
  routes?: string[];
}

export default function sitemapPlugin(options: SitemapPluginOptions): Plugin {
  const { baseUrl, routes = [] } = options;

  const defaultRoutes = [
    '/',
    '/play',
    '/play/local',
    '/play/bot',
    '/play/multiplayer',
  ];

  const allRoutes = [...defaultRoutes, ...routes];

  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    writeBundle() {
      const sitemap = generateSitemap(baseUrl, allRoutes);
      // This will be written to the dist folder by Vite
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap,
      });
    },
  };
}

function generateSitemap(baseUrl: string, routes: string[]): string {
  const currentDate = new Date().toISOString();
  
  const urlElements = routes.map(route => {
    const fullUrl = `${baseUrl}${route}`;
    return `    <url>
      <loc>${fullUrl}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}
