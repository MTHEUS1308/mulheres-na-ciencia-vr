import * as THREE from 'three';
import {multimediaCard} from './multimedia-card.js';
import {imageViewer} from './image-viewer.js';

// Opt-in presentation of existing pages. Poses are set once, never head-followed.
export function monitorStation(parent,targets,pages,makeLabel){
 const radius=1.44,angles=[0,-56,56],ownedTargets=new Set();
 const monitors=pages.map((page,index)=>{
  const group=new THREE.Group(),angle=THREE.MathUtils.degToRad(angles[index]);
  group.name=`Polonium_monitor_${index+1}`;group.position.set(Math.sin(angle)*radius,.20,-Math.cos(angle)*radius);group.rotation.y=-angle;group.scale.setScalar(1.03);parent.add(group);
  const card=multimediaCard({...page,pageLabel:`MONITOR ${index+1} / ${pages.length}`});group.add(card.face);if(card.diagram)group.add(card.diagram);
  const viewer=page.image?imageViewer(card,makeLabel):null;
  if(viewer){for(const node of viewer.nodes)group.add(node);for(const target of viewer.targets){target.userData.monitorIndex=index;targets.push(target);ownedTargets.add(target);}}
  return{group,card,viewer,page,index};
 });
 const active=()=>monitors.find(m=>m.viewer?.modalActive);
 return{monitors,ready:Promise.all(monitors.map(m=>m.card.ready)).then(values=>values.every(Boolean)),
  update(time,focus){for(const m of monitors){m.card.update(time);m.viewer?.update(time,focus);}},
  setOpacity(value){for(const m of monitors)for(const mesh of [m.card.face,m.card.diagram].filter(Boolean))mesh.material.opacity=value;},
  acceptsTarget(target){const modal=active();return ownedTargets.has(target)&&(!modal||modal.viewer.acceptsTarget(target)&&modal.viewer.targets.includes(target));},
  get imageView(){return(active()??monitors[0])?.viewer?.state??null;},
  reset(){for(const m of monitors)m.viewer?.reset();},
  dispose(){for(const target of ownedTargets){const i=targets.indexOf(target);if(i>=0)targets.splice(i,1);}for(const m of monitors){m.viewer?.dispose();m.card.dispose();parent.remove(m.group);}ownedTargets.clear();},
 };
}
