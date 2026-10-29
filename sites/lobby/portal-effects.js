import * as THREE from 'three';
const v=(x,y,z=0)=>new THREE.Vector3(x,y,z);
function path(points,color,opacity=.5){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));}
function ring(radius,color){return new THREE.Mesh(new THREE.TorusGeometry(radius,.009,5,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.5,depthWrite:false}));}
function glowTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(.35,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;}
export async function effectAssets(){
 const loader=new THREE.TextureLoader(),[moon,saturn]=await Promise.all(['moon','saturn'].map(name=>loader.loadAsync(`/assets/katherine-johnson/textures/2k_${name}.webp`)));for(const t of [moon,saturn])t.colorSpace=THREE.SRGBColorSpace;return{glow:glowTexture(),moon,saturn};
}
export function portalEffects(parent,index,assets){
 const root=new THREE.Group();root.name=['Curie_energy_art','Lamarr_radio_waves','Johnson_cosmic_window'][index];parent.add(root);
 const color=['#3df2ad','#f2bb62','#a290ff'][index],accent=['#49aeca','#57bcff','#f1d49a'][index];
 // Broad translucent aura: shared sprite texture, no postprocessing or light/shadow passes.
 const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:assets.glow,color,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending}));aura.position.set(0,.15,-.30);aura.scale.set(3.4,4.6,1);root.add(aura);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(1.65,48),new THREE.MeshBasicMaterial({map:assets.glow,color,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.61,.20);root.add(floor);
 // One particle draw per portal, deterministic points and gentle frame-rate-independent motion.
 const count=48,positions=new Float32Array(count*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const particles=new THREE.Points(geometry,new THREE.PointsMaterial({map:assets.glow,color,size:.047,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(particles);
 const rings=[],markers=[],planets=[],circuits=[];
 if(index===0){
  for(let i=0;i<2;i++){const r=ring(1.42+i*.12,color);r.scale.y=.70;r.position.set(0,.15,.03);r.rotation.x=.6+i*.7;r.rotation.y=i*.5;root.add(r);rings.push(r);}
  // Tiny atom motifs orbit the outside of the frame, leaving titles and the hit area clear.
  for(let j=0;j<3;j++){const atom=new THREE.Group(),nucleus=new THREE.Mesh(new THREE.SphereGeometry(.032,8,6),new THREE.MeshBasicMaterial({color:accent}));atom.add(nucleus);for(let k=0;k<2;k++){const r=ring(.11,color);r.rotation.y=k?Math.PI/2:0;r.rotation.x=.5;atom.add(r);}root.add(atom);markers.push(atom);}
  const outline=[];for(let i=0;i<80;i++){const a=i/80*Math.PI*2;outline.push(v(Math.cos(a)*1.10,Math.sin(a)*1.56,.10));}root.add(path([...outline,outline[0]],color,.25));
 }else if(index===1){
  for(let i=0;i<3;i++){const r=ring(.65,color);r.position.set(0,.4,-.02);root.add(r);rings.push(r);}
  for(const side of [-1,1]){const points=[v(side*1.12,-1.1,.04),v(side*1.28,-.80,.04),v(side*1.28,.35,.04),v(side*1.10,.60,.04),v(side*1.10,1.2,.04)];root.add(path(points,accent,.45));circuits.push(points);const dot=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),new THREE.MeshBasicMaterial({color:accent}));root.add(dot);markers.push(dot);}
  const antenna=new THREE.Group();antenna.position.set(1.35,1.05,.02);const mast=path([v(0,0),v(0,.38)],accent,.7);antenna.add(mast);const head=new THREE.Mesh(new THREE.SphereGeometry(.045,10,6),new THREE.MeshBasicMaterial({color}));head.position.y=.38;antenna.add(head);for(const side of [-1,1])antenna.add(path([v(0,.13),v(side*.15,0)],color));root.add(antenna);
 }else{
  const data=[['moon',.18,[-1.35,.60,.05]],['saturn',.24,[1.36,1.20,-.15]],['blue',.15,[1.30,-.65,.13]]];const sphere=new THREE.SphereGeometry(1,24,16);
  for(const[name,size,pos]of data){const p=new THREE.Mesh(sphere,new THREE.MeshPhongMaterial({map:assets[name]??null,color:name==='blue'?'#4a9bd4':'#ffffff',shininess:8}));p.scale.setScalar(size);p.position.set(...pos);root.add(p);p.userData.baseY=p.position.y;planets.push(p);if(name==='saturn'){const r=new THREE.Mesh(new THREE.RingGeometry(1.35,2.05,48),new THREE.MeshBasicMaterial({color:'#d4bd87',transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-.85;r.rotation.y=.25;p.add(r);}}
  for(let i=0;i<2;i++){const r=ring(1.42+i*.08,i?accent:color);r.scale.y=.5;r.rotation.set(.35+i*.4,.3,-.3+i*.6);r.position.y=.35;root.add(r);rings.push(r);}
  const nebula=new THREE.Sprite(new THREE.SpriteMaterial({map:assets.glow,color:'#6146a9',transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));nebula.position.set(.1,.4,-.24);nebula.scale.set(2.8,2.0,1);root.add(nebula);
  const trajectory=Array.from({length:65},(_,i)=>{const x=i/64*2.5-1.25;return v(x,1.7+.12*Math.sin(x*2),.02);});root.add(path(trajectory,accent,.45));const marker=new THREE.Mesh(new THREE.SphereGeometry(.027,8,6),new THREE.MeshBasicMaterial({color:accent}));root.add(marker);markers.push(marker);
 }
 // Effects are visual only: not in the gaze target array, and explicitly non-raycastable.
 root.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints||o.isSprite)o.raycast=()=>{};});
 let focus=0,last=null;
 return{root,get focus(){return focus;},setQuality(q){geometry.setDrawRange(0,q>=2?48:q>=1.5?32:18);},animate(time,selected,progress){const t=time/1000,dt=last===null?0:Math.min(.1,Math.max(0,(time-last)/1000));last=time;
  const desired=selected ? .3+.7*progress : 0;focus=THREE.MathUtils.damp(focus,desired,7,dt);
  aura.material.opacity=.12+focus*.16+Math.sin(t*.7+index)*.012;floor.material.opacity=.16+focus*.20;particles.material.opacity=.40+focus*.30;
  for(let i=0;i<count;i++){const a=i*2.399+t*.055*(index===1?-1:1),r=(1.24+(i%7)*.025)*(1-.045*focus);positions[i*3]=Math.cos(a)*r;positions[i*3+1]=Math.sin(a)*1.68+.10+Math.sin(t*.25+i)*.035;positions[i*3+2]=Math.sin(i*1.31+t*.16)*.24+.06;}geometry.attributes.position.needsUpdate=true;
  for(const[r,i]of rings.map((r,i)=>[r,i])){if(index===1){const phase=(t*.15+i/3)%1;r.scale.setScalar(.8+phase*1.45+focus*.12);r.material.opacity=Math.sin(phase*Math.PI)*(.24+focus*.35);r.rotation.y=.3*Math.sin(t*.2+i);}else{r.rotation.z=t*(i?.07:-.05);r.material.opacity=.26+focus*.38;}}
  for(const[p,i]of planets.map((p,i)=>[p,i])){p.rotation.y=t*.075;p.position.y=p.userData.baseY+Math.sin(t*.3+i)*.025;}
  if(index===0)for(const[a,i]of markers.map((a,i)=>[a,i])){const theta=t*.14+i*2*Math.PI/3;a.position.set(Math.cos(theta)*1.24,Math.sin(theta)*1.65+.1,.18);a.rotation.y=t*.24;}
  else if(index===1)for(const[dot,i]of markers.map((d,i)=>[d,i])){const route=circuits[i],p=((t*.24+i*.5)%1)*(route.length-1),k=Math.floor(p);dot.position.lerpVectors(route[k],route[Math.min(k+1,route.length-1)],p-k);}
  else{const x=((t*.12)%1)*2.5-1.25;markers[0].position.set(x,1.7+.12*Math.sin(x*2),.02);}
 }};
}
