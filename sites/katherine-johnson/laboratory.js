import * as THREE from 'three';
import {createSpace} from './space.js';
import {createPlanets} from './planets.js';
import {createInteractions} from './interactions.js';
import {createHistory} from './history.js';
import {createMathematics} from './holograms.js';
import {createSpacecraft} from './spacecraft.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function laboratory(scene,targets,open,renderer,status=()=>{}){
 status('Preparando o universo dos cálculos…');const space=createSpace(scene);
 const environmentScene=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(environmentScene,.04);scene.environment=environment.texture;scene.environmentIntensity=.32;environmentScene.dispose();pmrem.dispose();
 status('Carregando a Terra e os planetas…');const planets=await createPlanets(scene,renderer);
 const spacecraft=createSpacecraft(scene,planets);const mathematics=createMathematics(scene);
 const history=await createHistory(scene);
 const interactions=createInteractions(scene,targets,open,{mathematics,history,spacecraft,planets});
 const root=space.root;root.name='Katherine_universe_of_calculations';
 return{root,stage:7,orbiter:spacecraft.orbiter,rocket:spacecraft.rocket,launch:spacecraft.launch,get launchState(){return spacecraft.launchState;},earth:planets.earth,planets:planets.planets,setQuality(v){space.setQuality(v,renderer.getPixelRatio());planets.setQuality(v);spacecraft.setQuality(v);},animate(time,active,focus){interactions.animate(time,active,focus);space.animate(time);planets.animate(time);spacecraft.animate(time);mathematics.animate(time);}};
}
