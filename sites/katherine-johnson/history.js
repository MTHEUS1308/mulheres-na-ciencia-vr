import * as THREE from 'three';
import {hologram} from './holograms.js';
import {historySpecs,atlas,photo} from './content.js';
export async function createHistory(scene){
 const load=url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error(`Imagem indisponível: ${url}`));image.src=url;});
 const[art,archive]=await Promise.all([load(atlas),load(photo)]);
 const boards=historySpecs.map(spec=>{const h=hologram({...spec,width:1.15,height:1.13,image:{bitmap:spec.tile===null?archive:art,tile:spec.tile===null?undefined:spec.tile}});scene.add(h.group);return{...h,spec};});
 return{boards};
}
