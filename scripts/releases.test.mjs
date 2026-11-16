import {test} from 'node:test';
import assert from 'node:assert/strict';
import {platformOf,releaseData} from './releases.mjs';
import {helpEntries,renderHelp} from '../src/lib/help.mjs';
import {readFile} from 'node:fs/promises';
test('packages are separated from signatures and checksums',()=>{assert.equal(platformOf('BigLazyCat-windows-amd64-portable.zip'),'windows');assert.equal(platformOf('BigLazyCat-arm64.dmg'),'macos');assert.equal(platformOf('BigLazyCat.AppImage'),'linux');assert.equal(platformOf('app.apk'),'android');assert.equal(platformOf('app.exe.sig'),null);assert.equal(platformOf('SHA256SUMS'),null);assert.throws(()=>releaseData({draft:true}));});
test('all translated help documents preserve their routes and links',async()=>{const zh=JSON.parse(await readFile(new URL('../src/data/zh-CN/help.json',import.meta.url)));const en=JSON.parse(await readFile(new URL('../src/data/en-US/help.json',import.meta.url)));const keys=data=>helpEntries(data).map(entry=>`${entry.section}/${entry.doc}`).sort();assert.deepEqual(keys(zh),keys(en));assert.match(renderHelp('[AI](#/quickstart/aiSetup)','/website/','en-US'),/href="\/website\/en\/help\/quickstart\/aiSetup\/"/);for(const entry of helpEntries(zh)){assert.ok(entry.title);assert.ok(entry.body);}});
