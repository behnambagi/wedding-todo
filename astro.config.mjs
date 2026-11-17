import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'assets',
    inlineStylesheets: 'always',
  },
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
});
