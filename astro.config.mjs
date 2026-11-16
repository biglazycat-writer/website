import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: process.env.SITE_URL || 'https://biglazycat-writer.github.io',
  base: process.env.BASE_PATH === undefined ? '/website' : process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
});
