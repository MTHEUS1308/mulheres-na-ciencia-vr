import { GAZE_DURATION_MS } from '../vr/config.js';
import * as THREE from 'three';
import { gazeDebug, gazeTarget } from '../vr/gaze-debug.js';
import { ImageModalState } from './image-modal-state.js';

// Visible artwork never participates in selection or writes depth. Only these
// independent proxy meshes are raycast targets; borders have their own material.
export function imageViewer(card, makeLabel) {
  const nodes=[], targets=[];
  let alive=true,ready=false,texture=null;
  const modal=new ImageModalState();
  const origin=new THREE.Vector3(-.368671875,.1270703125,.022);
  const destination=new THREE.Vector3(0,.16,.022);
  function visual(mesh,role,order){mesh.userData.uiRole=role;mesh.renderOrder=order;mesh.raycast=()=>{};nodes.push(mesh);return mesh;}
  function plane(w,h,color,role,order){return visual(new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false})),role,order);}
  function proxy(w,h,role,z){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthWrite:false}));mesh.position.z=z;mesh.userData.uiRole=role;mesh.visible=false;nodes.push(mesh);targets.push(mesh);return mesh;}
  const hotspot=proxy(.459,.459,'image-hotspot',.009);hotspot.position.copy(origin);hotspot.position.z=.009;hotspot.userData.dwellDuration=GAZE_DURATION_MS;
  const frameGeometry=new THREE.BufferGeometry().setFromPoints([[-.235,-.235,0],[.235,-.235,0],[.235,.235,0],[-.235,.235,0]].map(p=>new THREE.Vector3(...p)));
  const border=visual(new THREE.LineLoop(frameGeometry,new THREE.LineBasicMaterial({color:'#e6c385',transparent:true,opacity:0,depthWrite:false})),'image-focus-border',305);border.position.copy(origin);border.position.z=.010;
  const shade=plane(1.32,.99,'#080d12','image-view-shade',320);shade.position.set(0,.10,.012);
  const backing=plane(1.23,.81,'#101a20','image-view-frame',321);backing.position.set(0,.15,.016);
  const artwork=plane(1,1,'#ffffff','image-enlarged',322);artwork.visible=false;
  const viewHotspot=proxy(1.23,.79,'image-view-hotspot',.026);viewHotspot.position.y=.16;viewHotspot.userData.activate=()=>{};viewHotspot.userData.gazeHold=true;
  const back=makeLabel('Fechar imagem',.46,.07,undefined,2.3);back.userData.uiRole='image-return';back.position.set(0,-.235,.034);back.renderOrder=350;back.material.transparent=true;back.material.depthWrite=false;back.visible=false;nodes.push(back);targets.push(back);
  const caption=visual(makeLabel('Imagem ampliada · olhe para Fechar imagem',1.12,.055,undefined,1.5),'image-view-caption',323);caption.position.set(0,.545,.028);caption.material.transparent=true;caption.material.depthWrite=false;
  const animated=[shade,backing,artwork,back,caption];for(const mesh of animated)mesh.visible=false;
  let imageWidth=.70,imageHeight=.70;
  function syncVisibility(){
    // Keep a modal capture target present even on the zero-progress opening frame.
    hotspot.userData.gazeDisabled=!ready||modal.active;
    hotspot.visible=ready&&!modal.active;
    viewHotspot.visible=modal.active;
    for(const mesh of animated)mesh.visible=modal.active;
  }
  function close(){
    if(modal.close())gazeDebug('image-close',{...gazeTarget(hotspot),phase:modal.phase});
  }
  hotspot.userData.activate=()=>{
    if(!ready||!modal.open())return;
    syncVisibility();
    gazeDebug('state-expanded',{...gazeTarget(hotspot),phase:modal.phase,activations:modal.activations});
    gazeDebug('modal-visible',{...gazeTarget(hotspot),modal:artwork.uuid,visible:artwork.visible,phase:modal.phase});
  };
  back.userData.activate=close;
  card.ready.then(ok=>{
    if(!alive||!ok||!card.imageAsset)return;
    const {image,tile}=card.imageAsset;
    const sw=tile===undefined?image.width:image.width/3,sh=tile===undefined?image.height:image.height/2;
    texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;
    if(tile!==undefined){texture.repeat.set(1/3,1/2);texture.offset.set((tile%3)/3,1-(Math.floor(tile/3)+1)/2);}
    texture.needsUpdate=true;artwork.material.map=texture;artwork.material.needsUpdate=true;
    const scale=Math.min(1.10/sw,.70/sh);imageWidth=sw*scale;imageHeight=sh*scale;
    const originalScale=Math.min(356/sw,420/sh)*1.32/1024;
    hotspot.scale.set(sw*originalScale/.459,sh*originalScale/.459,1);
    border.scale.copy(hotspot.scale);ready=true;syncVisibility();hotspot.userData.imageId=image.src+'#tile='+(tile??'full');gazeDebug('modal-created',{...gazeTarget(hotspot),modal:artwork.uuid,visible:artwork.visible});
  });
  function update(time,focus){
    if(!alive)return;
    const previous=modal.phase;modal.advance(time);syncVisibility();
    if(previous!==modal.phase)gazeDebug(modal.phase==='open'?'modal-open':modal.phase==='idle'?'modal-hidden':'modal-state',{
      ...gazeTarget(hotspot),phase:modal.phase,visible:artwork.visible,progress:modal.progress,
    });
    const eased=modal.progress*modal.progress*(3-2*modal.progress);
    border.material.opacity=hotspot.visible&&focus===hotspot ? .9 : 0;
    shade.material.opacity=eased*.55;backing.material.opacity=eased*.96;
    artwork.material.opacity=eased;back.material.opacity=eased;caption.material.opacity=eased;
    artwork.position.lerpVectors(origin,destination,eased);
    artwork.scale.set(imageWidth*(.72+.28*eased),imageHeight*(.72+.28*eased),1);
  }
  return {nodes,targets,update,close,
    get modalActive(){return modal.active;},
    acceptsTarget(mesh){return !modal.active||mesh===viewHotspot||mesh===back;},
    reset(){modal.reset();syncVisibility();border.material.opacity=0;},
    get state(){return {ready,expanded:modal.expanded,phase:modal.phase,modalActive:modal.active,modalVisible:artwork.visible,activationCount:modal.activations,progress:modal.progress,imageOpacity:artwork.material.opacity,originalOpacity:card.face.material.opacity};},
    dispose(){alive=false;for(const mesh of nodes){mesh.geometry.dispose();mesh.material.map?.dispose();mesh.material.dispose();}},
  };
}
