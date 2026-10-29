import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{mainTablePresentations,sidePresentations}from'../sites/marie-curie/main-table-content.js';
import{DEFAULT_GAZE_DURATION,PORTAL_GAZE_DURATION}from'../shared/vr/config.js';
test('element illustrations are standalone assets with explicit provenance, without atlas cropping',async()=>{
 for(const p of mainTablePresentations.polonium.pages.slice(0,2)){assert.ok(p.image.endsWith('/polonium-scientific.webp'));assert.equal(p.imageTile,undefined);assert.match(p.credit,/não é fotografia/);}
 const page=sidePresentations.radium.pages[0];assert.ok(page.image.endsWith('/pitchblende-museum.webp'));assert.equal(page.imageTile,undefined);assert.match(page.credit,/não rádio puro/);assert.match(page.credit,/CC BY-SA 2.0/);
 const svg=await readFile('public/assets/marie-curie/media/polonium-scientific.svg','utf8');const core=svg.slice(svg.indexOf('<ellipse'),svg.indexOf('Núcleo:'));assert.equal((core.match(/fill="url\(#proton\)"/g)??[]).length,84);assert.equal((core.match(/fill="url\(#neutron\)"/g)??[]).length,126);
 assert.equal(DEFAULT_GAZE_DURATION,1200);assert.equal(PORTAL_GAZE_DURATION,3000);
});
