import * as THREE from 'three';
export const palette={cyan:'#63d6ff',gold:'#e6b76c',navy:'#071724'};
export function createSpace(scene){
 const root=new THREE.Group();root.name='Katherine_observation_platform';scene.add(root);
 const metal=new THREE.MeshStandardMaterial({color:'#182c3a',metalness:.30,roughness:.78,envMapIntensity:.08});
 const dark=new THREE.MeshStandardMaterial({color:'#0b1723',metalness:.20,roughness:.85,envMapIntensity:.06});
 const cyan=new THREE.MeshBasicMaterial({color:palette.cyan}),gold=new THREE.MeshBasicMaterial({color:palette.gold});
 const base=new THREE.Mesh(new THREE.CircleGeometry(4.7,96),metal);base.material=metal.clone();base.material.depthWrite=false;base.renderOrder=-20;base.rotation.x=-Math.PI/2;base.position.y=-1.65;root.add(base);
 const deck=new THREE.Mesh(new THREE.CircleGeometry(4.55,96),dark);deck.material.depthWrite=false;deck.renderOrder=-19;deck.rotation.x=-Math.PI/2;deck.position.y=-1.625;root.add(deck);
 for(const[r,mat]of [[1.1,cyan],[3.55,cyan],[4.28,gold],[4.54,cyan]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.009,6,128),mat);ring.rotation.x=Math.PI/2;ring.position.y=-1.615;root.add(ring);}
 const fasteners=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.018,.009,8),metal,96),matrix=new THREE.Matrix4();
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2;matrix.makeTranslation(Math.cos(a)*4.40,-1.614,Math.sin(a)*4.40);fasteners.setMatrixAt(i,matrix);}root.add(fasteners);
 const grooves=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2;for(const r of [1.16,4.20])grooves.push(Math.cos(a)*r,-1.608,Math.sin(a)*r);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(grooves,3));root.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#304b5d',transparent:true,opacity:.75})));
 scene.background=new THREE.Color('#02050f');
 scene.add(new THREE.HemisphereLight('#a6d9ff','#152039',1.5));
 const sun=new THREE.DirectionalLight('#fff0d4',2.6);sun.position.set(-4,5,2);scene.add(sun);
 const rim=new THREE.DirectionalLight('#277ac2',.8);rim.position.set(4,1,-5);scene.add(rim);
 let seed=2026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const positions=[],colors=[],sizes=[],phases=[];
 for(let i=0;i<1500;i++){const a=random()*Math.PI*2,z=random()*2-1,r=27+random()*9,q=Math.sqrt(1-z*z);positions.push(Math.cos(a)*q*r,z*r,Math.sin(a)*q*r);const color=new THREE.Color(i%7===0?'#ffc77f':i%3===0?'#92caff':'#e5efff');colors.push(color.r,color.g,color.b);sizes.push(.35+random()*.7);phases.push(random()*Math.PI*2);}
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));starGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));starGeometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));starGeometry.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));
 const stars=new THREE.Points(starGeometry,new THREE.ShaderMaterial({depthWrite:false,vertexColors:true,uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`attribute float aSize;attribute float phase;uniform float time;uniform float pixelRatio;varying vec3 vColor;varying float vAlpha;void main(){vColor=color;vAlpha=.78+.08*sin(time*.45+phase);vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aSize*pixelRatio*100./max(-p.z,8.),1.,5.);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vColor*smoothstep(.5,.05,d)*vAlpha,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`}));stars.renderOrder=-30;stars.name='Spatial_star_field';scene.add(stars);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
 const gradient=c.createRadialGradient(128,128,0,128,128,125);gradient.addColorStop(0,'rgba(133,178,237,.44)');gradient.addColorStop(.25,'rgba(60,106,178,.24)');gradient.addColorStop(.65,'rgba(31,40,98,.10)');gradient.addColorStop(1,'rgba(8,14,44,0)');c.fillStyle=gradient;c.fillRect(0,0,256,256);
 for(let i=0;i<450;i++){const t=random()*Math.PI*7,r=t*5;const x=128+Math.cos(t+i%2*Math.PI)*r+(random()-.5)*18,y=128+Math.sin(t+i%2*Math.PI)*r*.6+(random()-.5)*10;c.fillStyle=`rgba(144,182,238,${.03+random()*.10})`;c.fillRect(x,y,2,2);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const nebulae=[];for(const[pos,w,h,angle]of [[[-13,7,-20],15,5,-.4],[[18,6,12],12,4,.3],[[-20,2,9],14,5,.15]]){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:'#678abe',transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending,rotation:angle}));sprite.position.set(...pos);sprite.scale.set(w,h,1);scene.add(sprite);nebulae.push(sprite);}
 return{root,stars,nebulae,animate(time){stars.material.uniforms.time.value=time/1000;},setQuality(value,ratio){starGeometry.setDrawRange(0,value<=1?650:value<=1.5?1050:1500);stars.material.uniforms.pixelRatio.value=ratio;}};
}
