import * as THREE from 'three';
import './styles/museum.css';
import {fixedCamera} from './vr/fixed-camera.js';
import {gazeControls} from './vr/gaze-controls.js';
import {orientationControls} from './vr/orientation-controls.js';
import {cardboardMode} from './vr/cardboard-mode.js';
import {GAZE_DURATION_MS,GAZE_TIME_LABEL,PORTAL_GAZE_TIME_LABEL,DEFAULT_QUALITY} from './vr/config.js';
import {infoPanel,label} from './ui/info-panel.js';
import {sceneManager} from './scenes/scene-manager.js';
import {lobbyReturn} from './ui/lobby-return.js';

const environments={
 lobby:{name:'Lobby · Mulheres na Ciência',color:'#8fdcf4',path:'/',load:()=>import('../sites/lobby/laboratory.js')},
 'marie-curie':{name:'Marie Curie · Radioatividade',color:'#c1ac80',path:'/sites/marie-curie/',load:()=>import('../sites/marie-curie/laboratory.js')},
 'hedy-lamarr':{name:'Hedy Lamarr · Comunicações',color:'#b88051',path:'/sites/hedy-lamarr/',load:()=>import('../sites/hedy-lamarr/laboratory.js')},
 'katherine-johnson':{name:'Katherine Johnson · Universo dos Cálculos',color:'#92adbe',path:'/sites/katherine-johnson/',load:()=>import('../sites/katherine-johnson/laboratory.js')},
};
let session;
export function start(id='lobby'){
 // Even another entry importing start cannot create a second canvas or renderer.
 if(session)return session.then(m=>{m.manager.navigate(id);return m;});
 session=createSession(environments[id]?id:'lobby');return session;
}
async function createSession(initialId){
 document.querySelector('#app').innerHTML=`<canvas id="scene" tabindex="0" aria-label="Museu VR: arraste ou use as setas para olhar"></canvas><header><a id="home-link" href="/">MULHERES NA CIÊNCIA / VR</a><span id="environment-name"></span></header><div class="reticle"></div><div class="toolbar"><button id="cardboard">Ativar VR Cardboard</button><button class="secondary" id="sensors">Ativar sensores</button><button class="secondary" id="recenter">Recentralizar</button><button class="secondary" id="settings">Configurações</button><span class="status" role="status">Preparando o museu…</span></div><aside class="settings" hidden><strong>Configurações da visita</strong><p>Olhar: <strong id="dwell">${GAZE_TIME_LABEL}</strong> nas demais interações. Portais: ${PORTAL_GAZE_TIME_LABEL}.</p><label>Qualidade <select id="quality"><option value="2" selected>Alta</option><option value="1.5">Equilibrada</option><option value="1">Econômica</option></select></label><p>Se a imagem perder fluidez, reduza a qualidade. Nos óculos, use “Qualidade / VR”.</p><p>Gire o celular para horizontal e ative VR uma vez. Sensores e tela cheia podem exigir permissão do navegador.</p><p id="credits-row"><a id="credits" target="_blank" rel="noopener">Fontes e créditos do ambiente</a></p><button id="close-settings">Fechar</button></aside><button class="vr-exit" id="exit-vr">Sair dos óculos</button>`;
 let cardboard;
 const status=text=>{document.querySelector('.status').textContent=text.replace('Olhe por 2 segundos para selecionar.',`Portais: ${PORTAL_GAZE_TIME_LABEL}; demais interações: ${GAZE_TIME_LABEL}.`).replace(/2 segundos/g,GAZE_TIME_LABEL);if(text.startsWith('Sem dados')&&cardboard?.enabled){cardboard.exit();}};
 const canvas=document.querySelector('#scene');let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch(error){status('WebGL indisponível. Ative a aceleração gráfica.');throw error;}
 renderer.toneMapping=THREE.ACESFilmicToneMapping;let quality=DEFAULT_QUALITY;renderer.setPixelRatio(Math.min(devicePixelRatio,quality));
 const scene=new THREE.Scene();scene.background=new THREE.Color('#030710');const camera=fixedCamera();scene.add(camera);
 const controls=orientationControls(camera,status);controls.bind(canvas);
 cardboard=cardboardMode(renderer,scene,camera);const targets=[],globalTargets=[];
 const panel=infoPanel(scene,camera,targets);let animationUntil=0,manager;
 const open=exhibit=>{if(manager.busy)return;panel.close();menu.visible=false;animationUntil=exhibit.kind==='meter'?performance.now()+9000:0;const close=()=>{animationUntil=0;};if(exhibit.presentation)panel.showPresentation(exhibit.presentation,close);else panel.show(exhibit.title,exhibit.text,close);manager.active?.lab.confirm?.(exhibit);};
 function ui(text,w,h,action,role){const mesh=label(text,w,h,undefined,2);mesh.material.transparent=true;mesh.material.depthTest=false;mesh.material.depthWrite=false;mesh.renderOrder=380;mesh.userData.activate=action;mesh.userData.uiRole=role;globalTargets.push(mesh);return mesh;}
 const home=lobbyReturn(scene,camera,globalTargets,id=>manager.navigate(id));
 const menu=new THREE.Group();scene.add(menu);menu.visible=false;
 function setQuality(value){quality=value;renderer.setPixelRatio(Math.min(devicePixelRatio,quality));manager?.setQuality(quality);document.querySelector('#quality').value=String(value);resize();}
 const menuTitle=label('Qualidade da visita',.95,.14);menuTitle.position.y=.46;menuTitle.material.depthTest=false;menuTitle.material.depthWrite=false;menuTitle.material.transparent=true;menuTitle.renderOrder=380;menu.add(menuTitle);
 for(const[text,value,y]of [['Alta',2,.23],['Equilibrada',1.5,.02],['Econômica',1,-.19]]){const item=ui(text,.85,.15,()=>{setQuality(value);menu.visible=false;gaze.selection.reset();},'quality-option');item.position.y=y;item.userData.quality=value;menu.add(item);}
 const menuClose=ui('Voltar à visita',.85,.14,()=>{menu.visible=false;gaze.selection.reset();},'quality-close');menuClose.position.y=-.42;menu.add(menuClose);
 const vrSettings=ui('Qualidade / VR',.48,.11,()=>{panel.close();menu.quaternion.setFromEuler(new THREE.Euler(0,new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ').y,0));menu.position.set(0,0,-2.05).applyQuaternion(menu.quaternion);menu.visible=true;},'vr-settings');scene.add(vrSettings);
 const recenterVR=ui('Recentralizar',.48,.11,()=>controls.recenter(),'vr-recenter');scene.add(recenterVR);
 const exitVR=ui('Sair dos óculos',.48,.11,()=>cardboard.exit(),'vr-exit');scene.add(exitVR);
 // Keep the corrected, visual-only cursor in the transparent queue, last per eye.
 const cursor=new THREE.Group();cursor.position.z=-2;camera.add(cursor);
 const dot=new THREE.Mesh(new THREE.RingGeometry(.012,.017,32),new THREE.MeshBasicMaterial({color:'#fff5dc',transparent:true,depthTest:false,depthWrite:false}));dot.renderOrder=1000;dot.raycast=()=>{};cursor.add(dot);
 const progressMesh=new THREE.Mesh(new THREE.RingGeometry(.022,.029,48),new THREE.MeshBasicMaterial({color:'#e2b86c',transparent:true,depthTest:false,depthWrite:false}));progressMesh.renderOrder=1001;progressMesh.raycast=()=>{};cursor.add(progressMesh);cursor.visible=false;
 // A 3D black curtain and loading label are rendered for BOTH stereo eyes.
 const curtain=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:'#000000',transparent:true,opacity:1,depthTest:false,depthWrite:false}));curtain.position.z=-.16;curtain.renderOrder=2000;curtain.raycast=()=>{};camera.add(curtain);
 const loading=label('Carregando ambiente…',1.12,.12,'#b5cbd9');loading.position.set(0,0,-1.7);loading.material.transparent=true;loading.material.depthTest=false;loading.material.depthWrite=false;loading.renderOrder=2001;loading.raycast=()=>{};camera.add(loading);
 let fadeAnimation=null;
 const fade=(to,duration)=>new Promise(resolve=>{fadeAnimation={from:curtain.material.opacity,to,start:performance.now(),duration,resolve};if(!duration){curtain.material.opacity=to;curtain.visible=to>0;loading.visible=to>0;fadeAnimation=null;resolve();}});
 function updateFade(time){if(!fadeAnimation)return;const a=fadeAnimation,t=a.duration?THREE.MathUtils.clamp((time-a.start)/a.duration,0,1):1,e=t*t*(3-2*t);curtain.material.opacity=a.from+(a.to-a.from)*e;curtain.visible=curtain.material.opacity>0;loading.visible=curtain.material.opacity>.92;loading.material.opacity=Math.max(0,(curtain.material.opacity-.92)/.08);if(t===1){fadeAnimation=null;a.resolve();}}
 const gaze=gazeControls(camera,targets,GAZE_DURATION_MS),originalHit=gaze.hit.bind(gaze);
 gaze.hit=point=>{if(manager?.busy)return null;const hidden=[];for(const mesh of targets)if((panel.group.visible&&!panel.acceptsTarget(mesh))||(menu.visible&&mesh.parent!==menu)){hidden.push([mesh,mesh.visible]);mesh.visible=false;}const hit=(!panel.group.visible&&!menu.visible&&home.hit(point))||originalHit(point);for(const[mesh,visible]of hidden)mesh.visible=visible;return hit;};
 const settings=document.querySelector('.settings');
 function anchorUI(){const yaw=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ').y,q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);for(const[mesh,pos]of [[recenterVR,[-.53,-.72,-2.1]],[vrSettings,[0,-.72,-2.1]],[exitVR,[.53,-.72,-2.1]]]){mesh.position.set(...pos).applyQuaternion(q);mesh.quaternion.copy(q);}}
 manager=sceneManager({world:scene,renderer,targets,globalTargets,loaders:Object.fromEntries(Object.entries(environments).map(([id,value])=>[id,id==='lobby'?async()=>{const module=await value.load();return{laboratory:(...args)=>module.laboratory(...args,target=>manager.navigate(target))};}:value.load])),open,status,fade,quality:()=>quality,
  beforeSwitch(){panel.reset();menu.visible=false;settings.hidden=true;animationUntil=0;gaze.selection.reset();},
  onActive(id,{historyMode='push'}={}){const env=environments[id];document.body.style.setProperty('--accent',env.color);document.querySelector('#environment-name').textContent=env.name;canvas.setAttribute('aria-label',`${env.name}: arraste ou use as setas para olhar`);document.title=`${env.name} · Mulheres na Ciência VR`;document.querySelector('#credits-row').hidden=false;document.querySelector('#credits').href=`/assets/${id}/media/credits.html`;if(historyMode!=='none')history[historyMode==='replace'?'replaceState':'pushState']({environment:id},'',env.path);anchorUI();home.reset(id);gaze.selection.reset();status(`Câmera fixa · ${id==='lobby'?`portais ${PORTAL_GAZE_TIME_LABEL}`:`olhar ${GAZE_TIME_LABEL}`} · qualidade ${quality===2?'Alta':quality===1.5?'Equilibrada':'Econômica'}`);},
 });
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}window.addEventListener('resize',resize);resize();
 document.querySelector('#home-link').onclick=e=>{e.preventDefault();manager.navigate('lobby');};
 document.querySelector('#recenter').onclick=()=>controls.recenter();
 document.querySelector('#sensors').onclick=async()=>{try{if(controls.enabled){controls.disable();status('Sensores desativados. Use toque e arraste.');}else await controls.enable();}catch(error){status(error.message);}};
 document.querySelector('#cardboard').onclick=async()=>{settings.hidden=true;const sensors=controls.enabled?Promise.resolve():controls.enable();const stereo=cardboard.enter();try{await sensors;}catch(error){status(`${error.message} Cardboard pode usar toque como alternativa.`);}await stereo;};
 document.querySelector('#exit-vr').onclick=()=>cardboard.exit();document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cardboard?.enabled)cardboard.exit();});
 document.querySelector('#settings').onclick=()=>{settings.hidden=!settings.hidden;gaze.selection.reset();};document.querySelector('#close-settings').onclick=()=>{settings.hidden=true;};document.querySelector('#quality').onchange=e=>setQuality(Number(e.target.value));
 let press;canvas.addEventListener('pointerdown',e=>{press=[e.clientX,e.clientY];});canvas.addEventListener('pointerup',e=>{if(cardboard.enabled||manager.busy||!settings.hidden||!press||Math.hypot(e.clientX-press[0],e.clientY-press[1])>6)return;camera.updateMatrixWorld(true);gaze.hit(new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1))?.userData.activate();});
 let popVersion=0;window.addEventListener('popstate',async()=>{const version=++popVersion;await manager.whenIdle;if(version!==popVersion)return;const id=Object.keys(environments).find(key=>environments[key].path===location.pathname)||'lobby';manager.navigate(id,{historyMode:'none'});});
 renderer.setAnimationLoop(time=>{controls.update();home.update({available:!manager.busy&&!!manager.active&&manager.active.id!=='lobby'&&!panel.group.visible&&!menu.visible&&settings.hidden});scene.updateMatrixWorld(true);recenterVR.visible=vrSettings.visible=exitVR.visible=cardboard.enabled&&!manager.busy&&!panel.group.visible&&!menu.visible;
  const progress=!manager.busy&&settings.hidden?gaze.update(time):(gaze.selection.reset(),0);document.querySelector('.reticle').style.setProperty('--progress',`${progress*100}%`);progressMesh.visible=progress>0;progressMesh.geometry.setDrawRange(0,Math.floor(progress*48)*6);cursor.visible=cardboard.enabled;home.feedback(time,gaze.selection.target);panel.update(time,gaze.selection.target);manager.animate(time,time<animationUntil,gaze.selection.target,progress);updateFade(time);cardboard.render();
 });
 const museum={camera,renderer,scene,targets,gaze,cardboard,controls,panel,manager,menu,home,openExhibit:open,get lab(){return manager.active?.lab;},get currentId(){return manager.active?.id;},get quality(){return quality;}};
 await manager.navigate(initialId,{historyMode:'replace'});window.museum=museum;return museum;
}
