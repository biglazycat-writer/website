import type { APIRoute } from 'astro';
import data from '../../data/plugins.json';
import { validateCatalog } from '../../lib/plugins.mjs';
export const GET: APIRoute = () => new Response(JSON.stringify(validateCatalog(data)), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
});
