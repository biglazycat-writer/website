import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('FAQ text contains no encoding replacement characters or question-mark corruption',async()=>{
 for(const language of ['zh-CN','en-US']){
  const data=JSON.parse(await readFile(new URL(`../src/data/${language}/portal.json`,import.meta.url),'utf8'));
  for(const text of [data.faq.title,data.faq.subtitle,...Object.values(data.faq.items)]){
   assert.ok(!/\uFFFD|\?{3,}/u.test(text),`Corrupted FAQ: ${language}: ${text}`);
  }
 }
});
test('marketing config has usable URLs and intact download labels',async()=>{
 const purchase=JSON.parse(await readFile(new URL('../src/data/purchase.json',import.meta.url),'utf8'));
 const downloads=JSON.parse(await readFile(new URL('../src/data/downloads.json',import.meta.url),'utf8'));
 assert.ok(['https:','mailto:'].includes(new URL(purchase.url).protocol));
 for(const asset of downloads.assets){
  assert.equal(new URL(asset.url).protocol,'https:');
  assert.ok(['windows','macos','android','linux'].includes(asset.platform));
  assert.ok(asset.name&&!/[?\uFFFD]/u.test(asset.name),`Corrupted package label: ${asset.name}`);
 }
});
