import * as THREE from 'three';
import { multimediaCard } from './multimedia-card.js';
import { imageViewer } from './image-viewer.js';
import {monitorStation} from './monitor-station.js';
export function label(text, width = .9, height = .17, color = '#e6d5af', fontScale = 1) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.round(1024 * height / width);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#25251fea'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#897953'; ctx.lineWidth = 3; ctx.strokeRect(4,4,canvas.width-8,canvas.height-8);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.min(text.includes('\n') ? 56 : 64 * fontScale, canvas.height * .42)}px Georgia`;
  text.split('\n').forEach((line,i,lines) => ctx.fillText(line,512,canvas.height/2+(i-(lines.length-1)/2)*70,950));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
}
export function infoPanel(scene, camera, targets) {
  const group = new THREE.Group(); scene.add(group); group.visible = false;
  let parts=[],card=null,viewer=null,station=null,onClose=()=>{},state=null,transition=null;
  function clear(){
    if(station){station.dispose();station=null;}
    if(viewer){for(const mesh of viewer.nodes)group.remove(mesh);for(const target of viewer.targets){const i=targets.indexOf(target);if(i>=0)targets.splice(i,1);}viewer.dispose();viewer=null;}
    if(card){group.remove(card.face);if(card.diagram)group.remove(card.diagram);card.dispose();card=null;}
    for(const mesh of parts){group.remove(mesh);mesh.geometry.dispose();mesh.material.map?.dispose();mesh.material.dispose();const i=targets.indexOf(mesh);if(i>=0)targets.splice(i,1);}parts=[];
    for(const child of group.children)child.visible=false;
  }
  function add(mesh,action){mesh.renderOrder=350;mesh.material.depthWrite=false;group.add(mesh);parts.push(mesh);if(action){mesh.userData.activate=action;targets.push(mesh);}return mesh;}
  function pose(upright=false){
    if(upright){const heading=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ').y;group.quaternion.setFromEuler(new THREE.Euler(0,heading,0,'YXZ'));}
    else group.quaternion.copy(camera.quaternion);
    group.scale.setScalar(upright?(1.65/1.9)*1.35:1);group.position.copy(camera.position).add(new THREE.Vector3(0,0,upright?-1.65:-1.9).applyQuaternion(group.quaternion));group.visible=true;
  }
  function fade(out=false){station?.setOpacity(out?1:0);transition={start:performance.now(),out};for(const mesh of [...parts,...(card?[card.face,card.diagram].filter(Boolean):[])]){mesh.material.transparent=true;mesh.material.opacity=out?1:0;}}
  function release(){const callback=onClose;onClose=()=>{};callback();}
  function page(){
    clear();
    if(state.presentation.layout==='monitors'){
      group.position.copy(camera.position);group.scale.setScalar(1);
      station=monitorStation(group,targets,state.presentation.pages,label);
      const close=add(label('Fechar / voltar',.55,.12,undefined,2.5),()=>{station?.reset();release();fade(true);});
      close.position.set(0,-.32,-1.42);close.userData.uiRole='panel-close';fade();return;
    }
    const current=state.presentation.pages[state.page];card=multimediaCard({...current,pageLabel:`${state.page+1} / ${state.presentation.pages.length}`});group.add(card.face);if(card.diagram)group.add(card.diagram);
    if(current.image){viewer=imageViewer(card,label);for(const mesh of viewer.nodes)group.add(mesh);targets.push(...viewer.targets);}
    const back=add(label('‹ Anterior',.26,.12,undefined,2.5));back.position.set(-.47,-.33,.006);back.userData.activate=()=>{state.page=Math.max(0,state.page-1);page();};targets.push(back);back.visible=state.page>0;
    const next=add(label('Próxima ›',.26,.12,undefined,2.5));next.position.set(.47,-.33,.006);next.userData.activate=()=>{state.page=Math.min(state.presentation.pages.length-1,state.page+1);page();};targets.push(next);next.visible=state.page<state.presentation.pages.length-1;
    const close=add(label('Fechar / voltar',.46,.12,undefined,2.5),()=>{viewer?.reset();release();fade(true);});close.position.set(0,-.33,.006);close.userData.uiRole='panel-close';
    fade();
  }
  const api={
    group,
    reset(){api.close();clear();group.clear();},
    close(){if(station){station.dispose();station=null;}viewer?.reset();release();group.visible=false;transition=null;state=null;},
    show(title,lines,callback=()=>{}){
      release();clear();state=null;transition=null;onClose=callback;pose();
      const content=add(label(`${title}\n\n${lines.join('\n')}`,1.25,.86));content.position.y=.12;
      const close=add(label('Fechar / interromper',.65,.12),()=>api.close());close.position.y=-.55;
    },
    showPresentation(presentation,callback=()=>{}){release();onClose=callback;state={presentation,page:0};pose(true);page();},
    update(time,focus=null){
      if(!group.visible)return;
      card?.update(time);viewer?.update(time,focus);station?.update(time,focus);
      if(transition){const t=Math.min(1,Math.max(0,(time-transition.start)/200));const eased=t*t*(3-2*t);const alpha=transition.out?1-eased:eased;station?.setOpacity(alpha);
        for(const mesh of [...parts,...(card?[card.face,card.diagram].filter(Boolean):[])])mesh.material.opacity=alpha;
        if(t===1){if(transition.out){group.visible=false;state=null;if(station){station.dispose();station=null;}}transition=null;}
      }
    },
    acceptsTarget(target){if(station)return target.userData.uiRole==='panel-close'&&target.parent===group||station.acceptsTarget(target);return target.parent===group&&(!viewer?.modalActive||viewer.acceptsTarget(target)||target.userData.uiRole==='panel-close');},
    get monitors(){return station?.monitors??[];},
    get state(){return state;},
    get imageView(){return station?.imageView??viewer?.state??null;},
    get imageReady(){return station?.ready??card?.ready??Promise.resolve(true);},
  };
  return api;
}
