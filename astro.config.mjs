import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import dotenv from 'dotenv';

dotenv.config();

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
  server: { port: 4321, host: true },
  build: { assets: 'assets', inlineStylesheets: 'auto' },
  image: { service: passthroughImageService() },
  vite: {
    build: {
      rollupOptions: {
        output: { manualChunks: { vendor: ['astro/components'] } }
      }
    }
  }
});
