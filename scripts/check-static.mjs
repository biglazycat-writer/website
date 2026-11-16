import {readdir,readFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const base=(process.env.BASE_PATH??'/website').replace(/\/$/,'');
const html=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())await walk(file);else if(file.endsWith('.html'))html.push(file);}}
await walk(root);
const failures=new Set();
for(const file of html){const content=await readFile(file,'utf8');for(const match of content.matchAll(/(?:href|src)="([^"<>]+)"/g)){const value=match[1].split(/[?#]/)[0];if(!value.startsWith('/')||value.startsWith('//'))continue;if(base&&value!==base&&!value.startsWith(base+'/')){failures.add(`Wrong base: ${value}`);continue;}const local=value.slice(base.length);let target=path.join(root,decodeURIComponent(local));if(!path.extname(target))target=path.join(target,'index.html');try{await access(target);}catch{failures.add(`Missing: ${value}`);}}}
if(failures.size){console.error([...failures].join('\n'));process.exit(1);}
console.log(`Checked local links and resources across ${html.length} static pages (${base||'/'}).`);
