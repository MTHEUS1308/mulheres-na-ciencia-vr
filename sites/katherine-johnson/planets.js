import * as THREE from 'three';
const base='/assets/katherine-johnson/textures/';
export async function createPlanets(scene,renderer){
 const loader=new THREE.TextureLoader();const names=['earth_daymap','earth_normal_map','earth_clouds','moon','mars','jupiter','saturn','saturn_ring_alpha','neptune'];
 const textures=Object.fromEntries(await Promise.all(names.map(async n=>{const map=await loader.loadAsync(`${base}2k_${n}.webp`);map.colorSpace=n==='earth_normal_map'?THREE.NoColorSpace:THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return[n,map];})));
 const sphere=new THREE.SphereGeometry(1,48,32),smallSphere=new THREE.SphereGeometry(1,32,20),root=new THREE.Group();root.name='Textured_planetary_exhibits';scene.add(root);
 const earthGroup=new THREE.Group();earthGroup.position.set(0,.20,-3.65);root.add(earthGroup);
 const earth=new THREE.Mesh(sphere,new THREE.MeshPhongMaterial({map:textures.earth_daymap,normalMap:textures.earth_normal_map,normalScale:new THREE.Vector2(.10,.10),shininess:12,specular:'#4a6473',emissive:'#254260',emissiveMap:textures.earth_daymap,emissiveIntensity:.25}));earth.scale.setScalar(.95);earthGroup.add(earth);
 const clouds=new THREE.Mesh(sphere,new THREE.MeshPhongMaterial({color:'#e8f6ff',alphaMap:textures.earth_clouds,transparent:true,opacity:.46,depthWrite:false,shininess:0}));clouds.scale.setScalar(.964);earthGroup.add(clouds);
 const atmosphere=new THREE.Mesh(sphere,new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color('#2c9cff')}},transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint;varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(tint,rim*.70);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));atmosphere.scale.setScalar(1.018);earthGroup.add(atmosphere);
 const gridVertices=[];for(let lat=-60;lat<=60;lat+=30){const phi=lat*Math.PI/180;for(let i=0;i<96;i++){for(const a of [i/96*Math.PI*2,(i+1)/96*Math.PI*2])gridVertices.push(Math.cos(phi)*Math.cos(a)*.957,Math.sin(phi)*.957,Math.cos(phi)*Math.sin(a)*.957);}}
 for(let lon=0;lon<180;lon+=30)for(let i=0;i<96;i++)for(const a of [i/96*Math.PI*2,(i+1)/96*Math.PI*2])gridVertices.push(Math.cos(lon*Math.PI/180)*Math.cos(a)*.957,Math.sin(a)*.957,Math.sin(lon*Math.PI/180)*Math.cos(a)*.957);
 const gridGeometry=new THREE.BufferGeometry();gridGeometry.setAttribute('position',new THREE.Float32BufferAttribute(gridVertices,3));const grid=new THREE.LineSegments(gridGeometry,new THREE.LineBasicMaterial({color:'#79d5f5',transparent:true,opacity:.16,depthWrite:false}));earthGroup.add(grid);
 const planets=[];for(const[name,size,pos]of [['moon',.48,[-3.9,1.8,-6.8]],['mars',.57,[-6.0,2.8,2.4]],['jupiter',1.25,[6.5,3.3,-7]],['saturn',.82,[6.8,2.6,6]],['neptune',.50,[-6.8,3.0,-7.8]]]){
  const mesh=new THREE.Mesh(smallSphere,new THREE.MeshPhongMaterial({map:textures[name],shininess:3,emissive:'#344354',emissiveMap:textures[name],emissiveIntensity:.12}));mesh.scale.setScalar(size);mesh.position.set(...pos);mesh.name=name;root.add(mesh);planets.push(mesh);
 }
 const saturn=planets.find(p=>p.name==='saturn');const rings=new THREE.RingGeometry(1.12,1.94,96);const uv=rings.attributes.uv,position=rings.attributes.position;
 for(let i=0;i<position.count;i++){const r=Math.hypot(position.getX(i),position.getY(i));uv.setXY(i,(r-1.12)/(.82),.5);}uv.needsUpdate=true;
 const ring=new THREE.Mesh(rings,new THREE.MeshPhongMaterial({map:textures.saturn_ring_alpha,side:THREE.DoubleSide,transparent:true,opacity:.75,depthWrite:false,color:'#c5ac7f',shininess:3}));ring.rotation.x=-Math.PI*.36;saturn.add(ring);
 // Concentric projection pedestal grounds the globe without obstructing its surface.
 const pedestal=new THREE.Group();pedestal.position.set(0,-1.50,-3.65);root.add(pedestal);
 const disk=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.27,.19,64),new THREE.MeshStandardMaterial({color:'#24384b',metalness:.65,roughness:.4}));pedestal.add(disk);
 for(const r of [.78,1.08]){const torus=new THREE.Mesh(new THREE.TorusGeometry(r,.012,6,96),new THREE.MeshBasicMaterial({color:r<1?'#e6b76c':'#49baf4'}));torus.rotation.x=Math.PI/2;torus.position.y=.105;pedestal.add(torus);}
 const projector=new THREE.Mesh(new THREE.CylinderGeometry(.12,.30,.18,32),new THREE.MeshStandardMaterial({color:'#416478',metalness:.5,roughness:.4}));projector.position.y=.14;pedestal.add(projector);
 return{root,earth,earthGroup,planets,clouds,atmosphere,animate(time){const t=time/1000;earth.rotation.y=-1.15+t*.025;clouds.rotation.y=-1.15+t*.028;for(const p of planets)p.rotation.y=t*.018;},setQuality(v){clouds.visible=v>1;atmosphere.visible=v>1;}};
}
