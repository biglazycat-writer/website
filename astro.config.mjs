import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import {siteOrigin} from './src/lib/seo.mjs';

export default defineConfig({
  site: siteOrigin(process.env.SITE_URL || undefined),
  base: process.env.BASE_PATH === undefined ? '/website' : process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
});
