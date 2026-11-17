import type { APIRoute } from 'astro';
import zh from '../data/zh-CN/help.json';
import en from '../data/en-US/help.json';
import { helpEntries } from '../lib/help.mjs';
import { xmlEscape } from '../lib/seo.mjs';
export const GET: APIRoute = ({site}) => {
  const base=import.meta.env.BASE_URL;
  const pages=[...['','en/','download/','en/download/','pricing/','en/pricing/','faq/','en/faq/'].map(path=>({path,updated:''})),...helpEntries(zh).map(item=>({path:`help/${item.section}/${item.doc}/`,updated:item.updated})),...helpEntries(en).map(item=>({path:`en/help/${item.section}/${item.doc}/`,updated:item.updated}))];
  const entries=pages.map(page=>{
    const neutral=page.path.replace(/^en\//,'');
    const url=(path:string)=>xmlEscape(new URL(`${base}${path}`,site).href);
    return `<url><loc>${url(page.path)}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(page.updated||'')?`<lastmod>${page.updated}</lastmod>`:''}<xhtml:link rel="alternate" hreflang="zh-CN" href="${url(neutral)}"/><xhtml:link rel="alternate" hreflang="en" href="${url(`en/${neutral}`)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${url(neutral)}"/></url>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
