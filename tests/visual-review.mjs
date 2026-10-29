import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();const errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false,screenOrientation:{type:'landscapePrimary',angle:0}});
await evaluate('window.museum=undefined');await call('Page.navigate',{url:'http://localhost:5173/sites/marie-curie/'});
for(let i=0;i<120;i++){if(await evaluate('!!window.museum'))break;await sleep(500);}
assert.equal(await evaluate('!!window.museum'),true);await mkdir('/tmp/curie-review',{recursive:true});
await evaluate(`museum.renderer.setAnimationLoop(null);document.querySelector('#begin').click();museum.panel.close();museum.menu.visible=false;`);
for(const [name,point] of [['front',[0,0,-1]],['window',[-4.4,-.15,-1.8]],['instruments',[4,-.2,.2]],['archive',[0,0,4.7]]].filter(([name])=>!process.env.CURIE_QUICK||name==='front')){
 await evaluate(`museum.camera.lookAt(${point.join(',')});museum.camera.updateMatrixWorld(true);museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);
 await writeFile(`/tmp/curie-review/${name}.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));console.log('VIEW',name);
}
await evaluate(`museum.camera.lookAt(0,0,-1);museum.camera.updateMatrixWorld(true);museum.targets.find(t=>t.userData.exhibit==='meter').userData.activate();museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);
await writeFile('/tmp/curie-review/panel.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
await evaluate(`museum.panel.close();museum.targets.find(t=>t.geometry?.parameters.width===.86).userData.activate();museum.scene.updateMatrixWorld(true);museum.cardboard.render()`);
await writeFile('/tmp/curie-review/menu.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
await evaluate(`museum.menu.visible=false;museum.cardboard.enabled=true;document.body.classList.add('cardboard');museum.camera.children[0].visible=true;museum.cardboard.render()`);
await writeFile('/tmp/curie-review/stereo.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
console.log('REPORT',await evaluate(`({camera:museum.camera.position.toArray(),calls:museum.renderer.info.render.calls,triangles:museum.renderer.info.render.triangles,textures:museum.renderer.info.memory.textures})`));console.log('ERRORS',errors);if(process.env.CURIE_CLOSE_BROWSER)await call('Browser.close');else ws.close();assert.equal(errors.length,0);
