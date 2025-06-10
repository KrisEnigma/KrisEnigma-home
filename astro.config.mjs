import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// https://astro.build/config
export default defineConfig({
  site: 'https://krisenigma.com',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    })
  ],
  server: {
    port: 4321,
    host: true
  },
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro/components']
          }
        }
      }
    }
  }
});