import * as THREE from 'three';
import {DEFAULT_GAZE_DURATION} from '../vr/config.js';

// Upright, world-space UI: pitch remains free so looking down reaches the button.
// A yaw dead zone absorbs small head movements; dwell freezes the heading.
export function lobbyReturn(scene,camera,targets,navigate){
 const group=new THREE.Group();group.name='Lobby_return_hologram';group.visible=false;scene.add(group);
 function texture(frame=false){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=360;const c=canvas.getContext('2d');
  c.lineJoin='round';c.lineWidth=frame?9:5;c.strokeStyle=frame?'#67dfff':'#48bce8';
  c.shadowColor='#24b6ff';c.shadowBlur=frame?24:10;
  c.beginPath();c.roundRect(22,22,1492,316,38);
  if(!frame){c.fillStyle='rgba(4,17,31,.86)';c.fill();}c.stroke();c.shadowBlur=0;
  if(!frame){
   c.strokeStyle='#b2edff';c.lineWidth=12;c.beginPath();c.moveTo(90,171);c.lineTo(156,109);c.lineTo(222,171);c.moveTo(108,155);c.lineTo(108,235);c.lineTo(204,235);c.lineTo(204,155);c.moveTo(145,235);c.lineTo(145,188);c.lineTo(168,188);c.lineTo(168,235);c.stroke();
   c.fillStyle='#e1f7ff';c.font='600 130px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Voltar ao Lobby',866,183,1190);
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
 }
 function visual(map,order){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.82,.192),new THREE.MeshBasicMaterial({map,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));mesh.renderOrder=order;mesh.raycast=()=>{};group.add(mesh);return mesh;}
 const face=visual(texture(),500),border=visual(texture(true),501);border.material.opacity=.18;
 const target=new THREE.Mesh(new THREE.PlaneGeometry(.96,.28),new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthTest:false,depthWrite:false}));
 target.name='Lobby_return_hotspot';target.userData.uiRole='lobby-return';target.userData.dwellDuration=DEFAULT_GAZE_DURATION;
 let fired=false,heading=0,last=null,initialized=false,highlight=0,wasAvailable=false;
 target.userData.activate=()=>{if(fired||!group.visible||!target.visible)return;fired=true;target.userData.gazeDisabled=true;navigate('lobby');};group.add(target);targets.push(target);
 const euler=new THREE.Euler(0,0,0,'YXZ'),up=new THREE.Vector3(0,1,0),offset=new THREE.Vector3(.55,-.68,-2.75),ray=new THREE.Raycaster(),center=new THREE.Vector2();
 function place(){group.quaternion.setFromAxisAngle(up,heading);group.position.copy(offset).applyQuaternion(group.quaternion).add(camera.position);group.updateMatrixWorld(true);}
 return {group,target,face,border,
  reset(){heading=euler.setFromQuaternion(camera.quaternion,'YXZ').y;initialized=true;last=null;fired=false;target.userData.gazeDisabled=false;wasAvailable=false;place();},
  hit(point=center){if(!group.visible||!target.visible||fired)return null;ray.setFromCamera(point,camera);return ray.intersectObject(target,false)[0]?.object??null;},
  update(time,{available,focus}){
   group.visible=target.visible=available&&!fired;
   if(group.visible&&!wasAvailable)target.userData.gazeHold=true;
   wasAvailable=group.visible;
   const dt=last===null?0:Math.min(.05,Math.max(0,(time-last)/1000));last=time;
   if(!initialized)this.reset();
   if(!group.visible)return;
   const yaw=euler.setFromQuaternion(camera.quaternion,'YXZ').y,delta=Math.atan2(Math.sin(yaw-heading),Math.cos(yaw-heading));
   const deadZone=THREE.MathUtils.degToRad(12);
   if(focus!==target&&Math.abs(delta)>deadZone)heading+=(delta-Math.sign(delta)*deadZone)*(1-Math.exp(-dt/ .85));
   place();
   // Closing a modal must not turn its former close-button gaze into a return.
   // Arm only after the visitor has looked outside the newly available hotspot.
   camera.updateMatrixWorld(true);ray.setFromCamera(center,camera);
   if(target.userData.gazeHold&&!ray.intersectObject(target,false).length)target.userData.gazeHold=false;
  },
  feedback(time,focus){const goal=focus===target?1:0;highlight+=(goal-highlight)*.16;border.material.opacity=.18+highlight*(.60+.10*Math.sin(time*.004));},
 };
}
