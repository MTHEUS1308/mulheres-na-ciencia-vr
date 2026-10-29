import * as THREE from 'three';
// Artistic suspended motes, not a representation of visible radiation.
// Positions are evaluated on the GPU; only time and viewport height change.
const drift=`vec3 drift(vec3 anchor,float phase,float amplitude,float t){return anchor+vec3(sin(t*.13+phase)*amplitude,sin(t*.11+phase*.71)*amplitude*.72,cos(t*.10+phase)*amplitude);}`;
export function radioactivityParticles(scene,renderer){
 const root=new THREE.Group();root.name='Curie_artistic_radioactivity_particles';scene.add(root);
 let seed=1898;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const count=128,anchors=[],phases=[],amplitudes=[],sizes=[],intensities=[],tints=[];
 for(let i=0;i<count;i++){
  let x,y,z;const type=i%8;
  if(type<2){x=.97+(random()-.5)*.48;y=-.27+random()*.58;z=-1.99+(random()-.5)*.48;}
  else if(type<4){x=2.25+(random()-.5)*.56;y=-.35+random()*.64;z=.15+(random()-.5)*.62;}
  else if(type===4){x=-.1+(random()-.5)*.70;y=-.23+random()*.62;z=-2.28+(random()-.5)*.42;}
  else{do{x=(random()-.5)*6.8;z=(random()-.5)*7.8;}while(Math.hypot(x,z)<1.85);y=-.86+random()*2.02;}
  anchors.push(x,y,z);phases.push(random()*Math.PI*2);amplitudes.push(.07+random()*.10);sizes.push(.012+random()*.018);intensities.push(.45+random()*.45);const color=new THREE.Color(i%3?'#43ef88':'#1ca86c');tints.push(color.r,color.g,color.b);
 }
 const uniforms={uTime:{value:0},uHeight:{value:renderer.domElement.height}};
 function attributes(indices,trail=false){const data={position:[],aPhase:[],aAmplitude:[],aSize:[],aIntensity:[],aTint:[],aAge:[]};for(const i of indices)for(let j=0;j<(trail?2:1);j++){data.position.push(...anchors.slice(i*3,i*3+3));data.aPhase.push(phases[i]);data.aAmplitude.push(amplitudes[i]);data.aSize.push(sizes[i]);data.aIntensity.push(intensities[i]);data.aTint.push(...tints.slice(i*3,i*3+3));data.aAge.push(j);}
  const g=new THREE.BufferGeometry();for(const[name,values]of Object.entries(data))g.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='position'||name==='aTint'?3:1));g.computeBoundingSphere();g.boundingSphere.radius+=.25;return g;}
 const declarations=`uniform float uTime;attribute float aPhase;attribute float aAmplitude;attribute float aIntensity;attribute vec3 aTint;varying vec3 vTint;varying float vAlpha;${drift}`;
 const points=new THREE.Points(attributes(Array.from({length:count},(_,i)=>i)),new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`${declarations}uniform float uHeight;attribute float aSize;void main(){vec3 p=drift(position,aPhase,aAmplitude,uTime);vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(aSize*uHeight/max(-view.z,.1),1.,12.);vTint=aTint;vAlpha=aIntensity*(.70+.16*sin(uTime*.38+aPhase));}`,
  fragmentShader:`varying vec3 vTint;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float core=exp(-d*d*24.);gl_FragColor=vec4(vTint,core*vAlpha);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`}));points.name='Curie_green_motes';points.renderOrder=1;points.raycast=()=>{};root.add(points);
 const trails=new THREE.LineSegments(attributes(Array.from({length:12},(_,i)=>i*9),true),new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`${declarations}attribute float aAge;void main(){vec3 p=drift(position,aPhase,aAmplitude,uTime-aAge*1.8);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);vTint=aTint;vAlpha=(1.-aAge*.85)*aIntensity*.14;}`,
  fragmentShader:`varying vec3 vTint;varying float vAlpha;void main(){gl_FragColor=vec4(vTint,vAlpha);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`}));trails.name='Curie_short_particle_trails';trails.renderOrder=1;trails.raycast=()=>{};root.add(trails);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d'),gradient=c.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(70,210,115,.50)');gradient.addColorStop(.35,'rgba(30,130,80,.12)');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,64,64);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const glows=[];for(const pos of [[.97,-.29,-1.99],[2.25,-.35,.15]]){const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,opacity:.13,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.set(...pos);glow.scale.set(.50,.38,1);glow.renderOrder=1;glow.raycast=()=>{};root.add(glow);glows.push(glow);}
 let running=true,updates=0;
 return{root,points,trails,get running(){return running;},get updates(){return updates;},setQuality(value){points.geometry.setDrawRange(0,value>=2?128:value>=1.5?88:48);trails.geometry.setDrawRange(0,value>=2?24:value>=1.5?16:8);},update(time){if(!running)return;uniforms.uTime.value=time/1000;uniforms.uHeight.value=renderer.domElement.height;glows.forEach((glow,i)=>glow.material.opacity=.12+.018*Math.sin(time*.00035+i));updates++;},stop(){running=false;}};
}
