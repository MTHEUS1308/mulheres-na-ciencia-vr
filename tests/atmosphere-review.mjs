import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression:`(()=>eval(${JSON.stringify(expression)}))()`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Log.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://localhost:5173/sites/marie-curie/'});for(let i=0;i<160;i++){if(await evaluate('!!window.museum'))break;await sleep(500);}assert.equal(await evaluate('!!window.museum'),true);
await mkdir('artifacts/atmosphere',{recursive:true});
await evaluate(`museum.renderer.setAnimationLoop(null);document.querySelector('#begin').click();museum.panel.close();museum.camera.lookAt(0,-.12,-2.2);museum.camera.updateMatrixWorld(true);museum.lab.animate(performance.now(),false);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);
const screenshot=async name=>process.env.MAIN_TABLE_FAST&&['table','meter-photo','meter-diagram'].includes(name)?undefined:writeFile(`artifacts/atmosphere/${name}.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
await screenshot('table');
for(const [name,point] of [['left',[-2.25,-.35,.1]],['right',[2.25,-.35,.15]],['windows',[-4.6,.55,-2.3]]]){
 await evaluate(`museum.camera.lookAt(${point.join(',')});museum.camera.updateMatrixWorld(true);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot(name);
}
const sideDistances=await evaluate(`museum.targets.filter(t=>['radium','notebook'].includes(t.userData.record?.id)).map(t=>({id:t.userData.record.id,distance:t.position.length()}))`);
assert.ok(sideDistances.every(t=>t.distance>1.8&&t.distance<2.6));

const records=await evaluate(`(()=>{const results=[];for(const target of museum.targets.filter(t=>t.userData.record)){museum.panel.close();museum.camera.lookAt(target.position);museum.camera.updateMatrixWorld(true);museum.scene.updateMatrixWorld(true);museum.gaze.selection.reset();const hit=museum.gaze.hit();museum.gaze.selection.update(hit,0);museum.gaze.selection.update(hit,2100);results.push({id:target.userData.record.id??target.userData.record.title,hit:hit?.userData.record===target.userData.record,visible:museum.panel.group.visible});}museum.panel.close();return results;})()`);
assert.equal(records.length,8);assert.ok(records.every(r=>r.hit&&r.visible));console.log('GAZE',records);
await evaluate(`museum.camera.lookAt(-.91,-.1,-2.16);museum.camera.updateMatrixWorld(true);museum.targets.find(t=>t.userData.record?.id==='meter').userData.activate();museum.panel.update(performance.now()+250)`);
assert.equal(await evaluate('museum.panel.imageReady'),true);
await evaluate(`museum.panel.update(performance.now()+300);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot('meter-photo');
await evaluate(`museum.targets.find(t=>t.parent===museum.panel.group&&t.position.x>.4&&t.visible).userData.activate();museum.panel.update(performance.now()+300);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);assert.equal(await evaluate('museum.panel.state.page'),1);await screenshot('meter-diagram');
const angle=await evaluate(`(()=>{const now=performance.now();museum.lab.animate(now,true);const a=museum.lab.pointer.rotation.z;museum.lab.animate(now+800,true);return a!==museum.lab.pointer.rotation.z;})()`);assert.equal(angle,true);
for(const key of ['polonium','microscope','glassware','notes','radium','notebook','awards']){
 await evaluate(`museum.panel.close();const t=museum.targets.find(t=>t.userData.record?.id==='${key}');museum.camera.lookAt(t.position);museum.camera.updateMatrixWorld(true);t.userData.activate();museum.panel.update(performance.now()+300)`);
 assert.equal(await evaluate('museum.panel.imageReady'),true);
 await evaluate(`museum.panel.update(performance.now()+500);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot(key);
 if(key==='notes')assert.ok(Math.abs(await evaluate('museum.panel.group.position.y'))<.01);
}
await evaluate(`museum.panel.close();museum.camera.lookAt(0,0,-1);museum.camera.updateMatrixWorld(true);museum.targets.find(t=>t.userData.record?.id==='meter').userData.activate();museum.panel.update(performance.now()+300);`);await evaluate('museum.panel.imageReady');
await evaluate(`museum.lab.setQuality(1.5);museum.cardboard.enabled=true;document.body.classList.add('cardboard');museum.camera.children[0].visible=true;museum.panel.update(performance.now()+500);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot('stereo-panel');
assert.deepEqual(await evaluate('museum.camera.position.toArray()'),[0,0,0]);
const closing=await evaluate(`(()=>{const button=museum.targets.find(t=>t.parent===museum.panel.group&&t.visible&&t.position.x===0&&t.userData.activate);const position=button.getWorldPosition(museum.camera.position.clone());museum.camera.lookAt(position);museum.camera.updateMatrixWorld(true);museum.gaze.selection.reset();const hit=museum.gaze.hit();museum.gaze.selection.update(hit,0);museum.gaze.selection.update(hit,2100);museum.panel.update(performance.now()+300);return {hit:hit===button,closed:!museum.panel.group.visible};})()`);
assert.deepEqual(closing,{hit:true,closed:true});console.log('CLOSE BY GAZE',closing);
await evaluate(`museum.cardboard.enabled=false;document.body.classList.remove('cardboard');museum.panel.close();museum.camera.lookAt(0,-.12,-2.2);museum.camera.updateMatrixWorld(true);museum.lab.animate(performance.now()+1000,false);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);await screenshot('after-panels');
const report=await evaluate(`({camera:museum.camera.position.toArray(),panelY:museum.panel.group.position.y,drawCalls:museum.renderer.info.render.calls,triangles:museum.renderer.info.render.triangles,textures:museum.renderer.info.memory.textures})`);
console.log('REPORT',report);console.log('ERRORS',errors);await writeFile('artifacts/atmosphere/validation.json',JSON.stringify({records,sideDistances,closing,report,errors},null,2));
ws.close();assert.equal(errors.length,0);
