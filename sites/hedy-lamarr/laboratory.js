import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {label} from '../../shared/ui/info-panel.js';
import {exhibits} from './content.js';
const base='/assets/hedy-lamarr/';
export async function laboratory(scene,targets,open,renderer,status=()=>{}){
 scene.background=new THREE.Color('#101918');status('Carregando a central de comunicações…');
 const[gltf,lightmap,reflection,metadata]=await Promise.all([
  new GLTFLoader().loadAsync(`${base}laboratory.glb`),new THREE.TextureLoader().loadAsync(`${base}irradiance.webp`),new RGBELoader().loadAsync(`${base}room-reflections.hdr`),fetch(`${base}scene-metadata.json`).then(r=>{if(!r.ok)throw Error('Metadados da sala indisponíveis');return r.json();}),
 ]);
 lightmap.flipY=false;lightmap.channel=1;lightmap.colorSpace=THREE.LinearSRGBColorSpace;lightmap.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(reflection);scene.environment=environment.texture;scene.environmentIntensity=.22;reflection.dispose();pmrem.dispose();
 const root=gltf.scene;root.name='Hedy_1940s_communications_room';root.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.lightMap=lightmap;m.lightMapIntensity=metadata.lightmapScale*.82;m.envMapIntensity=/steel|brass/i.test(m.name)?2.5:1;if(m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(m.transmission>0){m.transmission=0;m.transparent=true;m.opacity=.20;m.depthWrite=false;}}});scene.add(root);
 const lamp=new THREE.PointLight('#ffd19a',1.5,5,2);lamp.position.set(0,1.0,-1.2);scene.add(lamp);
 const proxyMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthWrite:false});
 for(const exhibit of exhibits){const target=new THREE.Mesh(new THREE.BoxGeometry(...exhibit.size),proxyMaterial);target.position.set(...exhibit.position);target.userData.record=exhibit;target.userData.exhibit=exhibit.kind;target.userData.activate=()=>open(exhibit);scene.add(target);targets.push(target);}
 const headings=[['CENTRAL DE COMUNICAÇÕES',1.6,.14,[0,.86,-3.29]],['SINAIS · SINCRONIA',1.1,.14,[-3.04,.88,.05]],['ROTAS · CONTEXTO HISTÓRICO',1.35,.14,[3.03,1.28,.15]],['HEDY LAMARR + GEORGE ANTHEIL',1.65,.14,[0,1.21,3.19]]];
 for(const[text,w,h,pos]of headings){const plaque=label(text,w,h);plaque.position.set(...pos);plaque.lookAt(0,pos[1],0);plaque.raycast=()=>{};scene.add(plaque);}
 const plaques=[['Olhe para o transmissor',[0,-.63,-1.86]],['Olhe para os instrumentos',[-1.62,-.63,-.05]],['Olhe para o navio',[1.62,-.63,.50]]];
 for(const[text,pos]of plaques){const plaque=label(text,.72,.12);plaque.position.set(...pos);plaque.lookAt(0,0,0);plaque.raycast=()=>{};scene.add(plaque);}
 // A separate wireframe accent never changes the materials of the historic model.
 const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:'#d6b16b',transparent:true,opacity:.5,depthWrite:false}));outline.visible=false;scene.add(outline);let confirmation=null;
 status('Central carregada. Entre para explorar pelo olhar.');
 return{root,environment,setQuality(){},confirm(exhibit){confirmation={exhibit,time:performance.now()};},animate(time,active,focus,progress=0){const recent=confirmation&&Math.max(0,time-confirmation.time)<450;const record=focus?.userData.record??(recent?confirmation.exhibit:null);outline.visible=!!record;if(record){outline.position.set(...record.position);outline.scale.set(...record.size.map(v=>v+ .025));outline.material.opacity=.20+progress*.35;}}};
}
