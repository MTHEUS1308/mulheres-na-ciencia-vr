import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { label } from '../../shared/ui/info-panel.js';
import { exhibits } from './content.js';
import { radioactivityParticles } from './radioactivity-particles.js';

const base = '/assets/marie-curie/';
export async function laboratory(scene, targets, open, renderer, status = () => {}) {
  scene.background = new THREE.Color('#151613');
  // Static geometry, PBR textures, UV1 irradiance and reflections are authored/baked offline.
  status('Carregando modelos e materiais históricos…');
  const [gltf, lightmap, reflection, metadata] = await Promise.all([
    new GLTFLoader().loadAsync(`${base}laboratory.glb`),
    new THREE.TextureLoader().loadAsync(`${base}irradiance.webp`),
    new RGBELoader().loadAsync(`${base}room-reflections.hdr`),
    fetch(`${base}scene-metadata.json`).then(response => { if (!response.ok) throw new Error('Metadados de iluminação indisponíveis'); return response.json(); }),
  ]);
  lightmap.flipY = false;
  lightmap.channel = 1;
  lightmap.colorSpace = THREE.LinearSRGBColorSpace;
  lightmap.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromEquirectangular(reflection);
  scene.environment = environment.texture;
  scene.environmentIntensity = .12;
  reflection.dispose(); generator.dispose();
  const root = gltf.scene;
  root.name = 'Curie_PBR_baked_laboratory';
  const glassMaterials = new Set();
  root.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = false; object.receiveShadow = false;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      material.lightMap = lightmap;
      material.lightMapIntensity = (metadata.lightmapScale ?? 1) * .8;
      material.envMapIntensity = /Main_aged_brass/i.test(material.name) ? 8 : /microscope|oil_lamp/i.test(material.name) ? 5 : 1;
      if (material.map) material.map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      if(material.transmission>0)glassMaterials.add(material);
    }
  });
  scene.add(root);
  // Small unshadowed direct highlights complement baked diffuse illumination on metals.
  // Fixed at the physical window/lamp positions; no moving lights or shadow passes.
  const windowGlint=new THREE.PointLight('#a8bfdc',1.6,6,2);
  windowGlint.position.set(-3.8,.65,-2.3);scene.add(windowGlint);
  const lampGlint=new THREE.PointLight('#ffc078',.85,3.5,2);
  lampGlint.position.set(1.22,-.16,-2.4);scene.add(lampGlint);
  const reader=metadata.mainTable?.readerPivot??[-.61,-.395,-1.851];
  const pivot=new THREE.Group();pivot.position.set(...reader);
  const pointer=new THREE.Mesh(new THREE.BoxGeometry(.003,.082,.002),new THREE.MeshBasicMaterial({color:'#241e16'}));pointer.position.y=.036;pivot.add(pointer);scene.add(pivot);
  const proxyMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthWrite:false});
  const sizes={meter:[.65,.84,.48],polonium:[.36,.22,.28],microscope:[.32,.52,.40],glassware:[.54,.38,.40],notes:[.52,.075,.40]};
  for(const exhibit of exhibits){
    let target;
    if(exhibit.mainTable){
      target=new THREE.Mesh(new THREE.BoxGeometry(...sizes[exhibit.id]),proxyMaterial);
      target.position.set(...exhibit.position);
    }else{
      target=label(exhibit.short,.72,.15);
      const side=['radium','notebook'].includes(exhibit.id);
      // Place side plaques just inside the table edge, clear of the specimens.
      target.position.set(exhibit.position[0]-(side?Math.sign(exhibit.position[0])*.48:0),-.58,exhibit.position[2]);target.lookAt(0,0,0);
    }
    target.userData.exhibit=exhibit.kind;target.userData.record=exhibit;target.userData.mainTable=!!exhibit.mainTable;
    target.userData.activate=()=>open(exhibit);targets.push(target);scene.add(target);
  }
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
  const glowContext=glowCanvas.getContext('2d'),gradient=glowContext.createRadialGradient(32,32,4,32,32,32);
  gradient.addColorStop(0,'rgba(242,211,153,.40)');gradient.addColorStop(.55,'rgba(230,192,120,.20)');gradient.addColorStop(1,'rgba(230,192,120,0)');glowContext.fillStyle=gradient;glowContext.fillRect(0,0,64,64);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(.45,.45,1);scene.add(halo);
  const particles=radioactivityParticles(scene,renderer);
  let confirmation=null;
  function setQuality(value){
    particles.setQuality(value);
    // Keep glass inexpensive in stereo: alpha transparency and PBR reflections
    // avoid an additional screen-space transmission render pass.
    for(const material of glassMaterials){
      material.transmission=0;material.opacity=value>=2?.12:.17;
      material.transparent=true;material.depthWrite=false;
      material.clearcoat=value>=2?.65:.3;material.clearcoatRoughness=.16;
      material.roughness=Math.max(.08,material.roughness);
      material.envMapIntensity=value>=2?2.6:2;material.needsUpdate=true;
    }
  }
  setQuality(1.5);
  const title=label('MARIE CURIE · PARIS, 1898',1.15,.17);
  title.position.set(0,1.7,-4.61);scene.add(title);
  const awards=label('1903 · PHYSIQUE\n1911 · CHIMIE',.66,.29);
  awards.position.set(-.5,.25,4.565);awards.rotation.y=Math.PI;scene.add(awards);
  status('Laboratório carregado. Entre para explorar com o olhar.');
  return {
    root,
    environment,
    setQuality,
    pointer:pivot,
    particles,
    dispose(){particles.stop();},
    confirm(exhibit){if(exhibit.mainTable)confirmation={exhibit,time:performance.now()};},
    animate(time,active,focus,progress=0){
      particles.update(time);
      pivot.rotation.z=active?Math.sin(time*.002)*.45:0;
      const elapsed=confirmation?Math.max(0,time-confirmation.time):Infinity;
      const record=focus?.userData.mainTable?focus.userData.record:elapsed<550?confirmation.exhibit:null;
      halo.visible=!!record;
      if(record){halo.position.set(...record.position);const pulse=elapsed<550?Math.pow(1-elapsed/550,2):0;halo.material.opacity=.08+progress*.10+pulse*.12;halo.scale.setScalar(.40+pulse*.08);}
    },
  };
}
