import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {circularOrbit,orbitRadius,launchSample} from './orbit.js';

function batch(parts,name){
 const buckets=new Map();for(const part of parts){part.updateMatrix();const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();geometry.applyMatrix4(part.matrix);geometry.deleteAttribute('uv');const list=buckets.get(part.material)??[];list.push(geometry);buckets.set(part.material,list);part.geometry.dispose();}
 const group=new THREE.Group();group.name=name;for(const[material,geometries]of buckets){const merged=mergeGeometries(geometries);if(!merged)throw Error('Could not merge spacecraft');group.add(new THREE.Mesh(merged,material));for(const geometry of geometries)geometry.dispose();}return group;
}
export function mercuryCapsule(scale=1){
 const black=new THREE.MeshStandardMaterial({color:'#26353f',metalness:.75,roughness:.52}),silver=new THREE.MeshStandardMaterial({color:'#a9bec8',metalness:.8,roughness:.34}),glass=new THREE.MeshPhysicalMaterial({color:'#1a8aba',metalness:.3,roughness:.14,clearcoat:1,emissive:'#17486c',emissiveIntensity:.2}),copper=new THREE.MeshStandardMaterial({color:'#704936',metalness:.65,roughness:.6});
 const parts=[];const add=(geometry,mat,pos=[0,0,0],rot)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(...pos);if(rot)mesh.rotation.set(...rot);parts.push(mesh);return mesh;};
 const profile=[[0,.33],[.03,.35],[.07,.35],[.13,.31],[.52,.17],[.61,.12],[.68,.12]].map(([y,r])=>new THREE.Vector2(r,y));
 add(new THREE.LatheGeometry(profile,48),black);add(new THREE.CylinderGeometry(.35,.31,.035,48),copper,[0,.018,0]);
 for(const[y,r]of [[.07,.35],[.15,.30],[.45,.195],[.61,.125]])add(new THREE.TorusGeometry(r,.009,6,48),silver,[0,y,0],[Math.PI/2,0,0]);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const rib=add(new THREE.BoxGeometry(.008,.43,.012),silver,[Math.cos(a)*.245,.31,Math.sin(a)*.245]);rib.rotation.set(Math.sin(a)*-.32,0,Math.cos(a)*.32);}
 add(new THREE.BoxGeometry(.115,.13,.012),silver,[0,.40,.22],[-.32,0,0]);add(new THREE.BoxGeometry(.085,.10,.014),glass,[0,.40,.232],[-.32,0,0]);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;add(new THREE.SphereGeometry(.008,6,4),silver,[Math.cos(a)*.34,.055,Math.sin(a)*.34]);}
 add(new THREE.CylinderGeometry(.08,.11,.08,24),black,[0,.72,0]);add(new THREE.CylinderGeometry(.014,.014,.18,12),silver,[0,.83,0]);
 const group=batch(parts,'Mercury_inspired_capsule');group.scale.setScalar(scale);return group;
}
export function mercuryAtlas(){
 const body=new THREE.MeshStandardMaterial({color:'#c0d0d8',metalness:.8,roughness:.38}),dark=new THREE.MeshStandardMaterial({color:'#243541',metalness:.55,roughness:.55}),oxide=new THREE.MeshStandardMaterial({color:'#b44931',metalness:.35,roughness:.5}),parts=[];
 function add(geo,mat,pos){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...pos);parts.push(mesh);return mesh;}
 add(new THREE.CylinderGeometry(.19,.20,1.70,48),body,[0,.95,0]);add(new THREE.CylinderGeometry(.20,.26,.22,32),dark,[0,.10,0]);
 for(const y of [.26,.42,1.25,1.74]){const ring=add(new THREE.TorusGeometry(.195,.007,6,48),dark,[0,y,0]);ring.rotation.x=Math.PI/2;}
 add(new THREE.CylinderGeometry(.12,.19,.25,32),body,[0,1.925,0]);
 for(const x of [-.15,.15])add(new THREE.CylinderGeometry(.044,.07,.13,20,1,true),dark,[x,-.035,0]);
 const model=batch(parts,'Mercury_Atlas_exhibition_model'),cap=mercuryCapsule(.42);cap.position.y=2.03;model.add(cap);
 const towerParts=[];for(const x of [-.035,.035])for(const z of [-.035,.035]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.28,8),oxide);pole.position.set(x,2.49,z);towerParts.push(pole);}
 const escape=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.13,16),oxide);escape.position.set(0,2.68,0);towerParts.push(escape);model.add(batch(towerParts,'Escape_tower'));
 const materials=new Set();model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;materials.add(o.material);}});return {model,materials};
}
export function createSpacecraft(scene,planetSystem){
 const earthGroup=planetSystem.earthGroup;const plane=new THREE.Group();plane.rotation.set(.48,0,.20);earthGroup.add(plane);
 const points=[];for(let i=0;i<128;i++){const a=i/128*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*orbitRadius,Math.sin(a)*orbitRadius,0));}
 const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#e9bb71',transparent:true,opacity:.85}));plane.add(orbit);
 const orbiter=mercuryCapsule(.24);plane.add(orbiter);const beacon=new THREE.Mesh(new THREE.SphereGeometry(.023,10,6),new THREE.MeshBasicMaterial({color:'#fff1c5'}));orbiter.add(beacon);beacon.scale.setScalar(1/.24);beacon.position.y=-.02;
 const direction=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.24,'#6bd4fa',.055,.028);plane.add(direction);
 const displayCapsule=mercuryCapsule(.92);displayCapsule.position.set(2.85,-1.04,1.15);displayCapsule.rotation.set(.12,-.25,.14);scene.add(displayCapsule);
 const presentationBase=new THREE.Mesh(new THREE.CylinderGeometry(.60,.67,.15,48),new THREE.MeshStandardMaterial({color:'#243e50',metalness:.65,roughness:.4}));presentationBase.position.set(2.85,-1.50,1.15);scene.add(presentationBase);
 const {model:rocket,materials:rocketMaterials}=mercuryAtlas();rocket.position.set(2.8,-1.48,-1.75);scene.add(rocket);
 const launchBase=new THREE.Mesh(new THREE.CylinderGeometry(.56,.64,.16,48),new THREE.MeshStandardMaterial({color:'#223e50',metalness:.65,roughness:.4}));launchBase.position.set(2.8,-1.56,-1.75);scene.add(launchBase);
 const flame=new THREE.Mesh(new THREE.ConeGeometry(.13,.62,16),new THREE.MeshBasicMaterial({color:'#ffcb7b',transparent:true,opacity:.75,depthWrite:false}));flame.rotation.z=Math.PI;flame.position.y=-.35;rocket.add(flame);flame.visible=false;
 const exhaust=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:'#9cafd0',size:.09,transparent:true,opacity:.22,depthWrite:false}));const smoke=[];for(let i=0;i<36;i++){const a=i*2.399,r=(i%6)*.023;smoke.push(Math.cos(a)*r,-.1-i*.027,Math.sin(a)*r);}exhaust.geometry.setAttribute('position',new THREE.Float32BufferAttribute(smoke,3));rocket.add(exhaust);exhaust.visible=false;
 const satellite=new THREE.Group();const satBody=new THREE.Mesh(new THREE.BoxGeometry(.17,.13,.14),new THREE.MeshStandardMaterial({color:'#b99b59',metalness:.65,roughness:.45}));satellite.add(satBody);
 const panelMaterial=new THREE.MeshStandardMaterial({color:'#235278',metalness:.45,roughness:.4});for(const x of [-.25,.25]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.27,.018,.18),panelMaterial);mesh.position.x=x;satellite.add(mesh);}scene.add(satellite);
 let requested=false,start=null,phase='idle',launchCount=0;
 function launch(){if(phase!=='idle'||requested)return false;requested=true;launchCount++;return true;}
 function animate(time){const t=time/1000,p=circularOrbit(t);orbiter.position.set(p.x,p.y,0);orbiter.rotation.set(0,0,p.theta+Math.PI/2);direction.position.copy(orbiter.position);direction.setDirection(new THREE.Vector3(-Math.sin(p.theta),Math.cos(p.theta),0));
  satellite.position.set(Math.cos(t*.035)*7,3.3+Math.sin(t*.035)*.6,Math.sin(t*.035)*7);
  if(requested){start=t;requested=false;}const launchState=launchSample(start===null?-1:t-start);phase=launchState.phase;rocket.position.y=-1.48+launchState.height;for(const mat of rocketMaterials)mat.opacity=launchState.opacity;
  flame.visible=exhaust.visible=launchState.thrust>0;flame.scale.set(.75+.25*launchState.thrust,launchState.thrust,1);flame.material.opacity=.6*launchState.thrust;exhaust.material.opacity=.20*launchState.thrust;
  if(phase==='idle')start=null;
 }
 return{orbiter,rocket,displayCapsule,satellite,plane,launch,animate,get launchState(){return{phase,count:launchCount,height:rocket.position.y+1.48};},setQuality(v){exhaust.geometry.setDrawRange(0,v<=1?12:36);}};
}
