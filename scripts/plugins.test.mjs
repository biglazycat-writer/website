import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCatalog,packageFilename} from '../src/lib/plugins.mjs';
const data=JSON.parse(await readFile(new URL('../src/data/plugins.json',import.meta.url),'utf8'));
test('published plugins have fixed releases, integrity and distinct download sources',()=>{
 const catalog=validateCatalog(structuredClone(data));
 assert.ok(catalog.plugins.length>=2);
 for(const plugin of catalog.plugins){
  const release=plugin.releases[0];
  assert.ok(release.downloads.length>=2);
  assert.ok(release.downloads.find(d=>d.id==='official').url.endsWith(`/plugins/packages/${packageFilename(plugin,release)}`));
  assert.ok(release.downloads.find(d=>d.id==='github').url.includes(`/releases/download/v${release.version}/`));
 }
});
test('invalid catalogs fail before publishing',()=>{
 const edits=[
  c=>c.schemaVersion=2,
  c=>c.plugins.push(c.plugins[0]),
  c=>c.plugins[0].releases[0].sha256='bad',
  c=>c.plugins[0].releases[0].size=0,
  c=>c.plugins[0].releases[0].downloads[0].url='http://example.com/plugin.tgz',
  c=>c.plugins[0].releases[0].downloads[0].url='https://user:secret@example.com/plugin.tgz',
  c=>c.plugins[0].releases[0].downloads.push(c.plugins[0].releases[0].downloads[0]),
  c=>c.plugins[0].releases[0].downloads=[],
 ];
 for(const edit of edits){const c=structuredClone(data);edit(c);assert.throws(()=>validateCatalog(c));}
});
test('catalog sorts releases by numeric version',()=>{
 const c=structuredClone(data),r=c.plugins[0].releases[0];
 c.plugins[0].releases=[{...r,version:'1.2.0'},{...r,version:'1.10.0'}];
 assert.equal(validateCatalog(c).plugins[0].releases[0].version,'1.10.0');
});
