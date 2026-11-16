import {test} from 'node:test';
import assert from 'node:assert/strict';
test('Pages custom domains use root even when configure-pages returns an empty base_path',async()=>{
 const previous=process.env.BASE_PATH;
 try {
  delete process.env.BASE_PATH;
  const project=await import('../astro.config.mjs?project');
  assert.equal(project.default.base,'/website');
  process.env.BASE_PATH='';
  const custom=await import('../astro.config.mjs?custom');
  assert.equal(custom.default.base,'/');
 } finally {if(previous===undefined)delete process.env.BASE_PATH;else process.env.BASE_PATH=previous;}
});
