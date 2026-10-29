import * as THREE from 'three';
import {label} from '../../shared/ui/info-panel.js';
import {presentations} from './content.js';
export function createInteractions(scene,targets,open,{mathematics,history,spacecraft,planets}){
 const records=[],material=new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthWrite:false});
 function register(target,id){const record={id,kind:id,presentation:presentations[id]};target.userData.record=record;target.userData.exhibit=id;target.userData.activate=()=>open(record);targets.push(target);records.push(target);return target;}
 function box(id,pos,size){const target=new THREE.Mesh(new THREE.BoxGeometry(...size),material);target.position.set(...pos);scene.add(target);return register(target,id);}
 const earth=new THREE.Mesh(new THREE.SphereGeometry(.98,32,20),material);earth.position.copy(planets.earthGroup.position);scene.add(earth);register(earth,'earth');
 for(const b of [...mathematics.boards,...history.boards]){const target=new THREE.Mesh(b.face.geometry.clone(),material);target.position.z=.018;b.group.add(target);register(target,b.spec.id);b.target=target;}
 const rocketTarget=box('rocket',[2.8,-.12,-1.75],[.66,2.74,.65]);box('capsule',[2.85,-.68,1.15],[.72,.95,.75]);
 function plaque(text,pos,width=.9){const p=label(text,width,.15,'#b9e9fa');p.position.set(...pos);p.lookAt(0,pos[1],0);scene.add(p);return p;}
 const orbit=plaque('Órbita · posição e tempo',[-1.38,-.62,-2.85],1.03);register(orbit,'orbit');
 plaque('Mercury · modelo educativo',[2.8,1.40,-1.75],1.06);
 plaque('Cápsula · John Glenn · 1962',[2.85,.08,1.15],1.06);
 plaque('KATHERINE JOHNSON · HISTÓRIA E LEGADO',[0,1.16,4.0],2.6);
 plaque('Modelo circular ideal · escala e tempo reduzidos',[0,-1.24,-3.0],1.9);
 const launch=plaque('Lançar demonstração',[2.25,-1.08,-1.28],.92);launch.userData.exhibit='launch';launch.userData.activate=()=>spacecraft.launch();targets.push(launch);
 const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,.015)),new THREE.LineBasicMaterial({color:'#f4c984',transparent:true,opacity:.85,depthTest:false,depthWrite:false}));outline.renderOrder=200;outline.visible=false;scene.add(outline);
 return{records,launch,animate(time,active,focus){rocketTarget.position.y=spacecraft.rocket.position.y+1.36;const board=[...mathematics.boards,...history.boards].find(b=>b.target===focus);outline.visible=!!board;if(board){outline.position.copy(board.group.position);outline.quaternion.copy(board.group.quaternion);outline.scale.set(board.face.geometry.parameters.width+.04,board.face.geometry.parameters.height+.04,1);}}};
}
