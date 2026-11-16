import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import path from 'node:path';
import {siteOrigin} from '../src/lib/seo.mjs';
const base=(process.env.BASE_PATH??'/website').replace(/\/$/,'');
const site=siteOrigin(process.env.SITE_URL||undefined);
const root=path.resolve('dist');
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const robots=await readFile(path.join(root,'robots.txt'),'utf8');
assert.ok(robots.includes(new URL(`${base}/sitemap.xml`,site).href));
const locations=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.equal(new Set(locations).size,locations.length);
assert.ok(!locations.some(url=>url.includes('404')||url.includes('#')));
for(const location of locations){const url=new URL(location);assert.equal(url.origin,new URL(site).origin);await access(path.join(root,url.pathname.slice(base.length),'index.html'));}
const html=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(file.endsWith('.html'))html.push(file);}}
await walk(root);
for(const file of html){const content=await readFile(file,'utf8');assert.match(content,/<meta name="description" content="[^"]+"/);assert.match(content,/<link rel="canonical" href="https:\/\//);const schema=content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);assert.ok(schema,`Missing schema: ${file}`);assert.ok(JSON.parse(schema[1])['@graph'].length>=3);if(file.endsWith('404.html'))assert.match(content,/noindex, follow/);else assert.match(content,/hreflang="x-default"/);}
const home=await readFile(path.join(root,'index.html'),'utf8');
const graph=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
assert.ok(graph.some(item=>item['@type']==='SoftwareApplication'));
assert.equal(graph.find(item=>item['@type']==='FAQPage').mainEntity.length,9);
console.log(`Verified SEO metadata on ${html.length} pages and ${locations.length} sitemap URLs (${new URL(site).origin}${base}/).`);
