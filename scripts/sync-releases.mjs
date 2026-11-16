import { readFile, writeFile } from 'node:fs/promises';
import { releaseData } from './releases.mjs';
const token=process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const configPath = new URL('../src/data/downloads.json', import.meta.url);
const config = JSON.parse(await readFile(configPath, 'utf8'));
if (!config.autoSync) {
  console.log('Using manually configured downloads; automatic sync disabled.');
  process.exit(0);
}
const response=await fetch('https://api.github.com/repos/biglazycat-writer/biglazycat-release/releases/latest',{headers:{Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`}:{})},signal:AbortSignal.timeout(30000)});
if(!response.ok) throw Error(`Release sync failed: HTTP ${response.status}`);
await writeFile(configPath,JSON.stringify({...config,...releaseData(await response.json())},null,2)+'\n');
