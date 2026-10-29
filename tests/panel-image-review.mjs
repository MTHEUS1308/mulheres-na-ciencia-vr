import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression:`(()=>eval(${JSON.stringify(expression)}))()`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
await call('Runtime.enable');await call('Log.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://localhost:5173/sites/marie-curie/'});for(let i=0;i<180;i++){if(await evaluate('!!window.museum'))break;await new Promise(r=>setTimeout(r,400));}assert.equal(await evaluate('!!window.museum'),true);
await mkdir('artifacts/panel-zoom',{recursive:true});
await evaluate(`museum.renderer.setAnimationLoop(null);document.querySelector('#begin').click();museum.menu.visible=false;museum.controls.disable();`);
const screenshot=async name=>writeFile(`artifacts/panel-zoom/${name}.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
const keys=await evaluate(`museum.targets.filter(t=>t.userData.record).map(t=>t.userData.record.id)`);
const reports=[];
for(const key of keys){
 await evaluate(`museum.panel.close();museum.camera.lookAt(0,0,-1);museum.camera.updateMatrixWorld(true);museum.targets.find(t=>t.userData.record?.id==='${key}').userData.activate()`);
 assert.equal(await evaluate('museum.panel.imageReady'),true);
 const pages=await evaluate('museum.panel.state.presentation.pages.length');
 for(let page=0;page<pages;page++){
  if(page>0){await evaluate(`museum.targets.find(t=>t.parent===museum.panel.group&&t.visible&&t.position.x>.4&&t.userData.activate).userData.activate()`);assert.equal(await evaluate('museum.panel.imageReady'),true);}
  const result=await evaluate(`(()=>{
   const m=museum,p=m.panel,g=p.group;let clock=performance.now()+300;p.update(clock);m.scene.updateMatrixWorld(true);
   const face=g.children.find(c=>c.userData.uiRole==='card-face'),diagram=g.children.find(c=>c.userData.uiRole==='card-animation');
   const hotspot=m.targets.find(t=>t.userData.uiRole==='image-hotspot');
   if(!hotspot?.visible)throw Error('Hotspot não carregou');
   const points=[[0,.3],[-.36,.3],[.36,.3],[-.36,0],[.36,0],[0,-.1]];
   const regions=[];
   function renderSample(){m.scene.updateMatrixWorld(true);m.cardboard.render();const gl=m.renderer.getContext(),pixel=new Uint8Array(4*5*5);gl.readPixels(Math.floor(gl.drawingBufferWidth/2)-2,Math.floor(gl.drawingBufferHeight/2)-2,5,5,gl.RGBA,gl.UNSIGNED_BYTE,pixel);if(gl.getError()!==gl.NO_ERROR)throw Error('Falha de leitura de pixels');return pixel;}
   for(const [x,y]of points){
    const world=hotspot.localToWorld(m.camera.position.clone().set(x*.459,y*.459,0));m.camera.lookAt(world);m.camera.updateMatrixWorld(true);m.gaze.selection.reset();clock+=20;m.gaze.update(clock);p.update(clock,m.gaze.selection.target);
    const actual=renderSample();if(diagram)diagram.visible=false;const reference=renderSample();if(diagram)diagram.visible=true;
    const delta=Math.max(...actual.map((v,i)=>Math.abs(v-reference[i])));
    regions.push({x,y,delta,hit:m.gaze.selection.target===hotspot,opacity:face.material.opacity});
   }
   return {page:p.state.page,regions,width:face.geometry.parameters.width*g.scale.x,distance:g.position.length(),imageView:p.imageView,transparentDepthWrite:diagram?.material.depthWrite??false,faceTarget:m.targets.includes(face)};
  })()`);
  assert.ok(result.regions.every(p=>p.hit&&p.opacity===1&&p.delta<=1),`${key}/${page}: ${JSON.stringify(result)}`);
  assert.ok(Math.abs(result.width-1.5475263157894736)<.001);assert.ok(Math.abs(result.distance-1.65)<.001);assert.equal(result.faceTarget,false);
  reports.push({key,...result});
  // Trigger using the actual shared raycaster and dwell timer, not activate() directly.
  const zoom=await evaluate(`(()=>{const m=museum,p=m.panel,hotspot=m.targets.find(t=>t.userData.uiRole==='image-hotspot');m.camera.lookAt(hotspot.getWorldPosition(m.camera.position.clone()));m.camera.updateMatrixWorld(true);m.gaze.selection.reset();let clock=performance.now()+1000;m.gaze.update(clock);p.update(clock,m.gaze.selection.target);m.gaze.update(clock+1799);p.update(clock+1799,m.gaze.selection.target);const early=p.imageView.expanded;m.gaze.update(clock+1801);p.update(clock+1801,m.gaze.selection.target);const samples=[p.imageView.progress];for(let i=1;i<=10;i++){m.scene.updateMatrixWorld(true);m.gaze.update(clock+1801+i*40);p.update(clock+1801+i*40,m.gaze.selection.target);samples.push(p.imageView.progress);}m.scene.updateMatrixWorld(true);m.cardboard.render();return {early,samples,state:p.imageView};})()`);
  assert.equal(zoom.early,false);assert.equal(zoom.state.expanded,true);assert.equal(zoom.state.progress,1);assert.equal(zoom.state.originalOpacity,1);assert.ok(zoom.samples.some(p=>p>0&&p<1));
  if(page===0&&['meter','microscope','polonium','awards'].includes(key))await screenshot(`${key}-zoom`);
  const returned=await evaluate(`(()=>{const m=museum,p=m.panel;const button=m.targets.find(t=>t.userData.uiRole==='image-return');m.camera.lookAt(button.getWorldPosition(m.camera.position.clone()));m.camera.updateMatrixWorld(true);m.gaze.selection.reset();let clock=performance.now()+4000;m.gaze.update(clock);m.gaze.update(clock+2100);for(let i=0;i<12;i++)p.update(clock+2100+i*40,m.gaze.selection.target);return p.imageView;})()`);
  assert.equal(returned.expanded,false);assert.equal(returned.progress,0);
  // Leaving the viewing area keeps the modal open until explicit closure.
  const leave=await evaluate(`(()=>{const m=museum,p=m.panel,h=m.targets.find(t=>t.userData.uiRole==='image-hotspot');m.camera.lookAt(h.getWorldPosition(m.camera.position.clone()));m.camera.updateMatrixWorld(true);m.gaze.selection.reset();let clock=performance.now()+8000;m.gaze.update(clock);m.gaze.update(clock+1801);for(let i=0;i<10;i++)p.update(clock+1801+i*40,m.gaze.selection.target);m.camera.lookAt(p.group.localToWorld(m.camera.position.clone().set(.67,.60,0)));m.camera.updateMatrixWorld(true);for(let i=0;i<12;i++){m.gaze.update(clock+2300+i*40);p.update(clock+2300+i*40,m.gaze.selection.target);}return p.imageView;})()`);
  assert.equal(leave.expanded,true);assert.equal(leave.progress,1);
  await evaluate(`(()=>{const m=museum,p=m.panel,b=m.targets.find(t=>t.userData.uiRole==='image-return');m.camera.lookAt(b.getWorldPosition(m.camera.position.clone()));m.camera.updateMatrixWorld(true);m.gaze.selection.reset();const t=performance.now();m.gaze.update(t);m.gaze.update(t+2100);for(let i=0;i<12;i++)p.update(t+2100+i*40,m.gaze.selection.target);})()`);
  assert.equal(await evaluate('museum.panel.imageView.phase'),'idle');
 }
 const closed=await evaluate(`(()=>{const m=museum,p=m.panel,b=m.targets.find(t=>t.parent===p.group&&t.position.y===-.33&&t.position.x===0);m.camera.lookAt(b.getWorldPosition(m.camera.position.clone()));m.camera.updateMatrixWorld(true);m.gaze.selection.reset();const now=performance.now();m.gaze.update(now);m.gaze.update(now+2100);p.update(now+2400,m.gaze.selection.target);return !p.group.visible;})()`);assert.equal(closed,true);
 console.log('PANEL',key,pages,'pages: image pixels, gaze, zoom, return, leave, close OK');
}
await evaluate(`museum.camera.lookAt(0,0,-1);museum.camera.updateMatrixWorld(true);museum.targets.find(t=>t.userData.record?.id==='meter').userData.activate();`);await evaluate('museum.panel.imageReady');await evaluate(`museum.panel.update(performance.now()+300);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot('larger-panel');
// Capture stereo output; panel-stereo-review.mjs checks each eye's pixels and frustum.
await evaluate(`museum.cardboard.enabled=true;document.body.classList.add('cardboard');museum.camera.children[0].visible=true;museum.cardboard.render()`);await screenshot('stereo-panel');
const stereo=await evaluate(`(()=>{const m=museum;return {camera:m.camera.position.toArray(),enabled:m.cardboard.enabled};})()`);assert.deepEqual(stereo.camera,[0,0,0]);assert.equal(stereo.enabled,true);
await evaluate(`const h=museum.targets.find(t=>t.userData.uiRole==='image-hotspot');museum.camera.lookAt(h.getWorldPosition(museum.camera.position.clone()));museum.camera.updateMatrixWorld(true);museum.gaze.selection.reset();let now=performance.now();museum.gaze.update(now);museum.gaze.update(now+1801);for(let i=0;i<10;i++)museum.panel.update(now+1801+i*40,museum.gaze.selection.target);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot('stereo-zoom');assert.equal(await evaluate('museum.panel.imageView.expanded'),true);
console.log('ERRORS',errors);await writeFile('artifacts/panel-zoom/validation.json',JSON.stringify({reports,stereo,errors},null,2));ws.close();assert.equal(errors.length,0);
