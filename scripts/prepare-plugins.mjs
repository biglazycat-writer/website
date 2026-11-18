import { readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateCatalog, packageFilename } from '../src/lib/plugins.mjs';

const catalog=validateCatalog(JSON.parse(await readFile(new URL('../src/data/plugins.json',import.meta.url),'utf8')));
const directory=new URL('../public/plugins/packages/',import.meta.url);
await mkdir(directory,{recursive:true});
for (const plugin of catalog.plugins) for (const release of plugin.releases) {
  const mirror=release.downloads.find(source=>source.id==='official');
  if (!mirror) continue;
  const filename=packageFilename(plugin,release);
  if (mirror.url!==`https://biglazycatwriter.top/plugins/packages/${filename}`) throw Error('Official mirror URL does not match package path');
  const target=new URL(filename,directory);
  const valid=buffer=>buffer.byteLength===release.size && createHash('sha256').update(buffer).digest('hex')===release.sha256;
  const existing=await readFile(target).catch(error=>{if(error.code!=='ENOENT')throw error;return null;});
  if (existing && valid(existing)) {console.log(`Verified cached ${filename}`);continue;}
  const origin=release.downloads.find(source=>source.id==='github');
  if (!origin) throw Error(`Missing mirror origin: ${filename}`);
  const response=await fetch(origin.url,{signal:AbortSignal.timeout(180000)});
  if (!response.ok) throw Error(`Package download failed: ${filename}: HTTP ${response.status}`);
  if (Number(response.headers.get('content-length'))>release.size) throw Error('Package exceeds configured size');
  const chunks=[];let size=0;
  for await (const chunk of response.body) {size+=chunk.byteLength;if(size>release.size)throw Error('Package exceeds configured size');chunks.push(chunk);}
  const data=Buffer.concat(chunks);
  if (!valid(data)) throw Error(`Package checksum or size mismatch: ${filename}`);
  const temporary=new URL(`${filename}.tmp`,directory);
  try {await writeFile(temporary,data);await rename(temporary,target);} finally {await rm(temporary,{force:true});}
  console.log(`Prepared verified mirror: ${filename}`);
}
