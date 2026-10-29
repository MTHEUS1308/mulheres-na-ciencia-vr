import * as THREE from 'three';
import {disposeEnvironment} from './resources.js';
// The world, renderer, camera, sensors, panels and gaze remain outside the scene
// lifecycle. Only the lightweight lobby is cached; laboratory GPU assets are
// released under a black fade, before loading the next laboratory.
export function sceneManager({world,renderer,targets,globalTargets,loaders,open,status,fade,beforeSwitch,onActive,quality}) {
 let active=null,busy=false,pending=Promise.resolve(false);const cache=new Map(),transitions=[],disposals=[];
 function clearWorld(){if(active)world.remove(active.scene);active=null;world.environment=null;world.background=new THREE.Color('#030710');targets.splice(0,targets.length,...globalTargets);}
 async function load(id){
  if(cache.has(id))return cache.get(id);
  const scene=new THREE.Scene(),ownedTargets=[],record={id,scene,targets:ownedTargets,lab:null};
  try{const module=await loaders[id]();record.lab=await module.laboratory(scene,ownedTargets,open,renderer,status);record.lab.setQuality?.(quality());if(id==='lobby')cache.set(id,record);return record;}
  catch(error){disposals.push({id,failed:true,...disposeEnvironment(record)});throw error;}
 }
 function attach(record){
  active=record;world.add(record.scene);
  for(const key of ['background','environment','environmentIntensity','backgroundIntensity','backgroundBlurriness','fog'])world[key]=record.scene[key];
  targets.splice(0,targets.length,...globalTargets,...record.targets);renderer.renderLists.dispose();
 }
 async function perform(id,options){
  const from=active?.id??null;
  try{
   beforeSwitch();
   await fade(1,from?320:0);
   const previous=active;clearWorld();
   if(previous&&previous.id!=='lobby')disposals.push({id:previous.id,...disposeEnvironment(previous)});
   renderer.renderLists.dispose();
   status('Carregando ambiente…');
   const next=await load(id);attach(next);await fade(1,80);onActive(id,options);transitions.push({from,to:id,time:performance.now()});
   await fade(0,380);return true;
  }catch(error){
   console.error('Falha na transição de ambiente:',error);
   if(active&&active.id!=='lobby'){const failed=active;clearWorld();disposals.push({id:failed.id,failed:true,...disposeEnvironment(failed)});}
   // Recover under the same black fade and in the same VR session.
   if(id!=='lobby'){try{attach(await load('lobby'));onActive('lobby',{historyMode:'replace'});}catch(recovery){console.error('Falha ao recuperar lobby:',recovery);}}
   status('Não foi possível carregar o ambiente. Tente novamente pelo lobby.');await fade(0,380);return false;
  }finally{if(transitions.length>64)transitions.splice(0,transitions.length-64);if(disposals.length>64)disposals.splice(0,disposals.length-64);busy=false;}
 }
 return{
  navigate(id,options={}){if(!loaders[id]||busy||active?.id===id)return Promise.resolve(false);busy=true;pending=perform(id,options);return pending;},
  get active(){return active;},get busy(){return busy;},get whenIdle(){return pending;},
  get diagnostics(){return{active:active?.id??null,busy,cached:[...cache.keys()],transitions:[...transitions],disposals:[...disposals]};},
  animate(time,animated,focus,progress){active?.lab.animate?.(time,animated,focus,progress);},
  setQuality(value){active?.lab.setQuality?.(value);for(const record of cache.values())if(record!==active)record.lab.setQuality?.(value);},
 };
}
