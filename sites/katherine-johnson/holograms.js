import * as THREE from 'three';
// Fixed world surfaces: geometry, text and indicators share one world transform.
export function hologram({title,formula,subtitle,position,width=1.35,height=.92,image=null}){
 const group=new THREE.Group();group.position.set(...position);group.lookAt(0,position[1],0);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*height/width);const c=canvas.getContext('2d');
 c.fillStyle='#071c2df2';c.fillRect(0,0,canvas.width,canvas.height);c.strokeStyle='#62c5e4';c.lineWidth=3;c.strokeRect(8,8,1008,canvas.height-16);
 c.fillStyle='#e7bc77';c.font='32px system-ui';c.fillText(title,35,62,950);
 if(image){const sw=image.tile===undefined?image.bitmap.width:image.bitmap.width/3,sh=image.tile===undefined?image.bitmap.height:image.bitmap.height/2,sx=(image.tile%3||0)*sw,sy=Math.floor((image.tile||0)/3)*sh;const h=canvas.height-178,w=Math.min(920,h*sw/sh);c.drawImage(image.bitmap,sx,sy,sw,sh,(1024-w)/2,85,w,h);}
 else{c.fillStyle='#d8f7ff';c.font='66px Georgia';c.fillText(formula,35,158,950);c.strokeStyle='#396a85';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(50,210+i*34);c.lineTo(970,210+i*34);c.stroke();}}
 c.fillStyle='#9ed9ec';c.font='28px system-ui';c.fillText(subtitle,35,canvas.height-35,950);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));group.add(face);
 const border=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(width+.025,height+.025)),new THREE.LineBasicMaterial({color:'#e6b76c',transparent:true,opacity:.48}));border.position.z=.006;group.add(border);
 return{group,face,border};
}
export function createMathematics(scene){
 const specs=[
  {id:'speed',title:'01 · VELOCIDADE ORBITAL',formula:'v = √(μ/r)',subtitle:'μ = GM · órbita circular ideal',position:[-3.1,.55,-1.15]},
  {id:'gravity',title:'02 · GRAVIDADE',formula:'|a| = μ/r²',subtitle:'A aceleração aponta para o centro',position:[-3.1,.55,.55]},
  {id:'coordinates',title:'03 · POSIÇÃO E TEMPO',formula:'x = r cos θ     y = r sen θ',subtitle:'θ = ωt · coordenadas no plano orbital',position:[-3.1,-.55,-1.15]},
  {id:'return',title:'04 · TRAJETÓRIA E RETORNO',formula:'T = 2π √(r³/μ)',subtitle:'Período circular · retorno exige nova trajetória',position:[-3.1,-.55,.55]},
 ];
 const boards=specs.map(spec=>{const h=hologram({...spec,width:1.25,height:.90});scene.add(h.group);return{...h,spec};});
 // A moving point and a radius vector explain the circular geometry on each board.
 for(const b of boards){const points=Array.from({length:65},(_,i)=>new THREE.Vector3(Math.cos(i/64*2*Math.PI)*.30,Math.sin(i/64*2*Math.PI)*.115-.15,.012));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#d7b574'}));b.group.add(line);const marker=new THREE.Mesh(new THREE.SphereGeometry(.017,8,6),new THREE.MeshBasicMaterial({color:'#8ae7ff'}));b.group.add(marker);b.marker=marker;}
 return{boards,animate(time){for(const[b,i]of boards.map((b,i)=>[b,i])){const t=time/1000*.27+i;b.marker.position.set(Math.cos(t)*.30,Math.sin(t)*.115-.15,.017);}}};
}
