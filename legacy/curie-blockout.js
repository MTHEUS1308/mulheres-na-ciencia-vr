import * as THREE from 'three';
import { label } from '../../shared/ui/info-panel.js';
import { exhibits } from './content.js';
export function laboratory(scene, targets, open) {
  const mats = new Map();
  const material = color => { if (!mats.has(color)) mats.set(color,new THREE.MeshLambertMaterial({color})); return mats.get(color); };
  const cube = new THREE.BoxGeometry(1,1,1);
  function box(size, pos, color) { const mesh = new THREE.Mesh(cube,material(color)); mesh.scale.set(...size); mesh.position.set(...pos); scene.add(mesh); return mesh; }
  scene.background = new THREE.Color('#bbb1a0');
  scene.add(new THREE.HemisphereLight('#fff1d4','#675846',2.4));
  const sun = new THREE.DirectionalLight('#fff0d4',2.1); sun.position.set(-4,3,-1); scene.add(sun);
  box([10,.15,10],[0,-1.7,0],'#70533c');
  box([10,.15,10],[0,2.6,0],'#c9bfaa');
  box([10,4.3,.15],[0,.45,-5],'#b6aa91'); box([10,4.3,.15],[0,.45,5],'#a99b82');
  for (const x of [-5,5]) box([.15,4.3,10],[x,.45,0],'#c4b8a0');
  for (let x=-4.8;x<5;x+=.6) box([.014,.008,10],[x,-1.62,0],'#493c30');
  for (const x of [-4.7,0,4.7]) box([.18,.25,10],[x,2.45,0],'#574333');
  for (const z of [-4.8,4.8]) box([10,.16,.08],[0,-1.48,z],'#5c4938');
  // Janelas altas: luz natural sugerida, sem texturas ou sombras dinâmicas.
  for (const z of [-2.7,1.8]) {
    box([.12,2.6,2],[-4.86,.6,z],'#584a39');
    box([.03,2.35,1.75],[-4.77,.6,z],'#c8d3cf');
    box([.05,2.4,.07],[-4.73,.6,z],'#6c5942');
    box([.05,.07,1.8],[-4.73,.6,z],'#6c5942');
  }
  function table(x,z,w,d) {
    box([w,.16,d],[x,-.65,z],'#765337');
    for(const dx of [-w/2+.15,w/2-.15]) for(const dz of [-d/2+.12,d/2-.12]) box([.12,.9,.12],[x+dx,-1.15,z+dz],'#4c3b2c');
  }
  table(0,-3.6,6.3,1.2); table(-3.9,.3,1.1,2.5); table(3.9,.3,1.1,2.5);
  for(const y of [-.8,.2,1.2]) box([2.5,.1,.55],[3.3,y,4.5],'#6b4e35');
  for(let i=0;i<10;i++) box([.12,.5,.32],[2.3+i*.2,-.5,4.5],['#685341','#8a7d58','#4e5b58'][i%3]);
  const glass = new THREE.MeshPhongMaterial({color:'#b2bcb5',transparent:true,opacity:.5,shininess:65});
  for(let i=0;i<6;i++) {
    const flask = new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),glass); flask.position.set(-.7+i*.35,-.4,-3.8); scene.add(flask);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.3,10),glass); neck.position.set(-.7+i*.35,-.16,-3.8); scene.add(neck);
  }
  let needle;
  for(const exhibit of exhibits) {
    const [x,y,z] = exhibit.position;
    const sign = label(exhibit.short,1.8,.38); sign.position.set(x,y+.55,z); sign.lookAt(0,sign.position.y,0);
    sign.userData.activate = () => open(exhibit); targets.push(sign); scene.add(sign);
    if(exhibit.kind==='meter') {
      box([.9,.65,.6],[x,-.25,z],'#383a36');
      const dial=label('0   20   40   60',.75,.28); dial.position.set(x,-.12,z+.31); scene.add(dial);
      needle=box([.025,.22,.025],[x,-.14,z+.34],'#b37739');
    } else if(exhibit.kind==='mineral') {
      box([.65,.08,.65],[x,-.49,z],'#c4b99d');
      const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.25,0),material('#4f4b45')); rock.position.set(x,-.26,z); scene.add(rock);
    } else if(exhibit.kind==='book') {
      const book=box([.65,.08,.75],[x,-.48,z],'#e5d4af'); book.rotation.y=.3;
      for(let i=0;i<5;i++) box([.4,.004,.012],[x,-.435,z-.22+i*.09],'#8e8065');
    } else {
      const award=label('1903 · PHYSIQUE\n1911 · CHIMIE',2.6,1); award.position.set(x,.05,4.8); award.rotation.y=Math.PI; scene.add(award);
    }
  }
  const title=label('MARIE CURIE\nParis · 1898',2.8,.9);title.position.set(0,1.45,-4.88);scene.add(title);
  return { animate(time, active) { if(needle) needle.rotation.z=active ? Math.sin(time*.006)*.55 : 0; } };
}
