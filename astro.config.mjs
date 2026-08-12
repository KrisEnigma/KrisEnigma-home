import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://krisenigma.com',
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
  ],
  server: { port: 4500, host: true },
  build: { assets: 'assets', inlineStylesheets: 'auto' },
  image: { service: passthroughImageService() },
  vite: {
    server: {
      // LAN hostname from home DNS (pc.lan). 4321 is blocked by Hyper-V port exclusions on Kris-PC.
      allowedHosts: ['pc.lan', '.lan'],
    },
    build: {
      rollupOptions: {
        output: { manualChunks: { vendor: ['astro/components'] } }
      }
    }
  }
});
