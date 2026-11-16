import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageUrls,helpDescription,softwareSchema,siteOrigin} from '../src/lib/seo.mjs';
test('pending custom-domain certificates do not produce HTTP canonical metadata',()=>{
 assert.equal(siteOrigin('http://biglazycatwriter.top'),'https://biglazycatwriter.top');
 assert.equal(siteOrigin('https://biglazycat-writer.github.io'),'https://biglazycat-writer.github.io');
});
test('translated canonical URLs remain correct at domain root and project paths',()=>{
 const project=pageUrls('https://biglazycat-writer.github.io','/website/','/website/en/help/writing/editor/');
 assert.equal(project.zh,'https://biglazycat-writer.github.io/website/help/writing/editor/');
 assert.equal(project.en,project.canonical);
 const root=pageUrls('https://biglazycatwriter.top','/','/');
 assert.equal(root.zh,'https://biglazycatwriter.top/');
 assert.equal(root.en,'https://biglazycatwriter.top/en/');
});
test('help snippets remove Markdown while preserving meaning',()=>{
 assert.equal(helpDescription('Read **Markdown** with [AI](#/ai/setup).\n\n## Details'),'Read Markdown with AI.');
});
test('software offers follow the visible configurable price without invented ratings',()=>{
 const data={site:'https://biglazycatwriter.top',base:'/',language:'en-US',description:'Writing software',purchase:{price:'\u00a5129',url:'https://example.com/buy'},downloads:{version:'0.4.6',fallbackUrl:'https://example.com/releases'}};
 const schema=softwareSchema(data);
 assert.equal(schema.offers.price,'129');assert.equal(schema.offers.priceCurrency,'CNY');assert.ok(!schema.aggregateRating);
 assert.ok(!softwareSchema({...data,purchase:{...data.purchase,price:''}}).offers);
});
