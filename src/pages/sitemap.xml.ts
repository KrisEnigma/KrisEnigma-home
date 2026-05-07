import type { APIRoute } from "astro";
export const prerender = true;

const SITE_URL = "https://krisenigma.com";

const pages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/creator", changefreq: "monthly", priority: "0.9" },
  { path: "/pro", changefreq: "monthly", priority: "0.9" },
  { path: "/contact", changefreq: "yearly", priority: "0.7" },
];

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();

  const urls = pages.map(({ path, changefreq, priority }) => {
    const espath = `${SITE_URL}${path}`;
    const enpath = `${SITE_URL}/en${path === '/' ? '/' : path}`;
    return `
    <url>
      <loc>${espath}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      <xhtml:link rel="alternate" hreflang="es" href="${espath}" />
      <xhtml:link rel="alternate" hreflang="en" href="${enpath}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${espath}" />
    </url>
    <url>
      <loc>${enpath}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      <xhtml:link rel="alternate" hreflang="es" href="${espath}" />
      <xhtml:link rel="alternate" hreflang="en" href="${enpath}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${espath}" />
    </url>`;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
</urlset>`;

  return new Response(sitemap, { headers: { "Content-Type": "application/xml" } });
};
