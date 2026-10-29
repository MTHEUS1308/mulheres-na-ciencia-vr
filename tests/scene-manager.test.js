import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sceneManager} from '../shared/scenes/scene-manager.js';
import {disposeEnvironment} from '../shared/scenes/resources.js';
import {GAZE_DURATION_MS,DEFAULT_QUALITY} from '../shared/vr/config.js';
import {DwellSelection} from '../shared/vr/gaze-controls.js';

test('shared default is 1.2 seconds and one activation until the target changes',()=>{
 assert.equal(GAZE_DURATION_MS,1200);assert.equal(DEFAULT_QUALITY,2);let calls=0;const gaze=new DwellSelection(),target={userData:{activate(){calls++;}}};gaze.update(target,0);assert.ok(gaze.update(target,1199)<1);assert.equal(calls,0);assert.equal(gaze.update(target,1200),1);gaze.update(target,9999);assert.equal(calls,1);
});
test('manager keeps global objects, only updates active scene, caches lobby and releases laboratories',async()=>{
 const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera();world.add(camera);const globalTarget=new THREE.Object3D(),targets=[globalTarget],loads={},updates={},disposed={},fades=[];let q=2;
 function loader(id){return async()=>({async laboratory(scene,list){loads[id]=(loads[id]??0)+1;const g=new THREE.BoxGeometry();g.addEventListener('dispose',()=>disposed[id]=(disposed[id]??0)+1);const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());scene.add(mesh);list.push(mesh);return{quality:0,setQuality(v){this.quality=v;},animate(){updates[id]=(updates[id]??0)+1;}};}});}
 const manager=sceneManager({world,renderer:{renderLists:{dispose(){}}},targets,globalTargets:[globalTarget],loaders:{lobby:loader('lobby'),marie:loader('marie'),hedy:loader('hedy')},open(){},status(){},fade:async(...args)=>fades.push(args),beforeSwitch(){},onActive(){},quality:()=>q});
 assert.equal(await manager.navigate('lobby'),true);manager.animate(0);const lobby=manager.active;assert.equal(lobby.lab.quality,2);
 const change=manager.navigate('marie');assert.equal(manager.busy,true);assert.equal(await manager.navigate('hedy'),false);await change;manager.animate(1);assert.equal(updates.lobby,1);assert.equal(lobby.scene.parent,null);assert.equal(world.children.length,2);assert.equal(targets.length,2);assert.equal(targets[0],globalTarget);assert.equal(world.children[0],camera);
 await manager.navigate('lobby');assert.equal(disposed.marie,1);assert.equal(manager.active,lobby);assert.equal(loads.lobby,1);q=1;manager.setQuality(q);await manager.navigate('marie');assert.equal(manager.active.lab.quality,1);await manager.navigate('lobby');assert.equal(loads.marie,2);assert.equal(disposed.marie,2);assert.equal(manager.diagnostics.cached.length,1);assert.ok(fades.some(([opacity])=>opacity===1));assert.ok(fades.some(([opacity])=>opacity===0));
});
test('failed load releases partial resources and recovers lobby in the same world',async()=>{
 const world=new THREE.Scene(),targets=[];let disposed=0;const expected=[];const original=console.error;console.error=(...args)=>expected.push(args);
 const manager=sceneManager({world,renderer:{renderLists:{dispose(){}}},targets,globalTargets:[],loaders:{lobby:async()=>({laboratory:async()=>({})}),bad:async()=>({laboratory:async(scene)=>{const g=new THREE.BoxGeometry();g.addEventListener('dispose',()=>disposed++);scene.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial()));throw Error('intentional load failure');}})},open(){},status(){},fade:async()=>{},beforeSwitch(){},onActive(){},quality:()=>2});
 try{await manager.navigate('lobby');assert.equal(await manager.navigate('bad'),false);assert.equal(disposed,1);assert.equal(manager.active.id,'lobby');assert.equal(manager.busy,false);assert.equal(world.children.length,1);assert.equal(expected.length,1);}finally{console.error=original;}
});
test('shared geometry, maps, bitmaps and PMREM target are released once per environment',()=>{
 const scene=new THREE.Scene(),geometry=new THREE.BoxGeometry(),texture=new THREE.Texture(),target=new THREE.WebGLRenderTarget(16,16);let geometryCount=0,materialCount=0,textureCount=0,rtCount=0,closed=0;texture.image={close(){closed++;}};const material=new THREE.MeshBasicMaterial({map:texture});geometry.addEventListener('dispose',()=>geometryCount++);material.addEventListener('dispose',()=>materialCount++);texture.addEventListener('dispose',()=>textureCount++);target.addEventListener('dispose',()=>rtCount++);
 scene.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));scene.environment=target.texture;disposeEnvironment({scene,lab:{environment:target}});assert.deepEqual([geometryCount,materialCount,textureCount,rtCount,closed],[1,1,1,1,1]);assert.equal(scene.children.length,0);
});
