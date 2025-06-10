// Sitemap.xml automático para mejor SEO
import type { APIRoute } from "astro";

const SITE_URL = "https://krisenigma.com";

// URLs estáticas del sitio
const staticUrls = ["", "/mediakit.pdf"];

export const GET: APIRoute = async () => {
  const urls = staticUrls
    .map((url) => {
      return `
    <url>
      <loc>${SITE_URL}${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${url === "" ? "weekly" : "monthly"}</changefreq>
      <priority>${url === "" ? "1.0" : "0.8"}</priority>
    </url>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
