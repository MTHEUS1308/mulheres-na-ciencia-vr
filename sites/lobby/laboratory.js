import * as THREE from 'three';
import {PORTAL_GAZE_DURATION,PORTAL_GAZE_TIME_LABEL} from '../../shared/vr/config.js';
import {effectAssets,portalEffects} from './portal-effects.js';
const portalSpecs=[
 {id:'marie-curie',name:'Marie Curie',subtitle:'A ciência da radioatividade',angle:-1.02,color:'#59e6c3',secondary:'#398bd7',tile:2,art:'/assets/marie-curie/media/science-illustrations-atlas.webp',symbol:'Po',number:'84'},
 {id:'hedy-lamarr',name:'Hedy Lamarr',subtitle:'A inovação nas comunicações',angle:0,color:'#f1bd69',secondary:'#c07837',tile:0,art:'/assets/hedy-lamarr/media/illustrations.webp',symbol:'f',number:'1942'},
 {id:'katherine-johnson',name:'Katherine Johnson',subtitle:'A matemática que alcançou o espaço',angle:1.02,color:'#aa91ff',secondary:'#48bfe9',tile:0,art:'/assets/katherine-johnson/media/illustrations.webp',symbol:'π',number:'1962'},
];
function text(text,w,h,color='#d8eeff',background='#091c2be8',font='Georgia'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(80,Math.round(1024*h/w));const c=canvas.getContext('2d');c.fillStyle=background;c.fillRect(0,0,1024,canvas.height);c.fillStyle=color;c.font=`${Math.min(canvas.height*.58,95)}px ${font}`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,512,canvas.height/2,970);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}));return mesh;
}
function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function arch(w,h,r,thickness){const shape=rounded(w,h,r),hole=rounded(w-thickness*2,h-thickness*2,Math.max(.05,r-thickness));shape.holes.push(new THREE.Path(hole.getPoints(16).reverse()));return new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:8});}
function line(points,color){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:.70}));}
const point=(x,y,z=0)=>new THREE.Vector3(x,y,z);
export async function laboratory(scene,targets,open,renderer,status=()=>{},navigate=()=>{}){
 scene.background=new THREE.Color('#030915');const root=new THREE.Group();root.name='Lobby_Mulheres_na_Ciencia';scene.add(root);
 scene.add(new THREE.HemisphereLight('#a7dfff','#172136',1.6));const main=new THREE.DirectionalLight('#9bdcff',3);main.position.set(-2,5,1);scene.add(main);const fill=new THREE.DirectionalLight('#ecb970',1.7);fill.position.set(3,2,-3);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(5.6,96),new THREE.MeshStandardMaterial({color:'#0b1c2c',metalness:.40,roughness:.7}));floor.material.depthWrite=false;floor.renderOrder=-20;floor.rotation.x=-Math.PI/2;floor.position.y=-1.63;root.add(floor);
 for(const[r,color]of [[1.06,'#46718c'],[3.05,'#31516d'],[4.80,'#56c5e8'],[5.1,'#dab474'],[5.55,'#638ce5']]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.009,6,128),new THREE.MeshBasicMaterial({color}));ring.rotation.x=Math.PI/2;ring.position.y=-1.60;root.add(ring);}
 const strokes=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2;strokes.push(point(Math.cos(a)*1.1,-1.60,Math.sin(a)*1.1),point(Math.cos(a)*5.45,-1.60,Math.sin(a)*5.45));}root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(strokes),new THREE.LineBasicMaterial({color:'#31516c'})));
 const stars=[];let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<750;i++){const a=rand()*Math.PI*2,y=rand()*.95+.05,q=Math.sqrt(1-y*y),r=22+rand()*7;stars.push(Math.cos(a)*q*r,y*r-1,Math.sin(a)*q*r);}const starfield=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(stars,3)),new THREE.PointsMaterial({color:'#b6c9f3',size:.027,sizeAttenuation:true}));starfield.renderOrder=-30;root.add(starfield);
 const title=text('Mulheres na Ciência',3.5,.40,'#f2dcac','#07172500');title.position.set(0,1.92,-4.1);root.add(title);
 const subtitle=text('UMA EXPOSIÇÃO · TRÊS HISTÓRIAS',2.8,.16,'#8bd7ed','#07172500','system-ui');subtitle.position.set(0,1.56,-4.0);root.add(subtitle);
 const welcome=text(`Escolha um portal · olhe por ${PORTAL_GAZE_TIME_LABEL}`,1.6,.13,'#b7d5e6');welcome.position.set(0,-.99,-2.1);welcome.rotation.x=-.22;root.add(welcome);
 const loader=new THREE.TextureLoader(),artMaps=await Promise.all(portalSpecs.map(p=>loader.loadAsync(p.art)));
 const assets=await effectAssets();
 const portals=[],proxyMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,colorWrite:false,depthWrite:false});
 for(const[spec,i]of portalSpecs.map((s,i)=>[s,i])){
  const group=new THREE.Group();group.name=`Portal_${spec.id}`;group.position.set(Math.sin(spec.angle)*4.12,0,-Math.cos(spec.angle)*4.12);group.lookAt(0,0,0);root.add(group);
  const metal=new THREE.MeshStandardMaterial({color:'#33475d',metalness:.75,roughness:.35});const frame=new THREE.Mesh(arch(2.06,3.06,.27,.12),metal);frame.position.set(0,-.035,-.14);group.add(frame);
  const outline=rounded(1.88,2.9,.20).getPoints(64).map(p=>point(p.x,p.y,.01));const rim=line(outline,spec.color);group.add(rim);
  const inner=new THREE.Mesh(new THREE.PlaneGeometry(1.78,2.7),new THREE.MeshBasicMaterial({color:spec.secondary,transparent:true,opacity:.12,depthWrite:false}));inner.position.set(0,0,-.025);group.add(inner);
  const map=artMaps[i];map.colorSpace=THREE.SRGBColorSpace;map.repeat.set(1/3,1/2);map.offset.set((spec.tile%3)/3,1-(Math.floor(spec.tile/3)+1)/2);map.needsUpdate=true;
  const picture=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.24),new THREE.MeshBasicMaterial({map,transparent:true,opacity:.86,depthWrite:false}));picture.position.set(0,.66,.025);picture.raycast=()=>{};group.add(picture);
  const title=text(spec.name,1.86,.24,spec.color);title.position.set(0,-.19,.04);group.add(title);
  const caption=text(spec.subtitle,1.86,.14,'#d4e3ec');caption.position.set(0,-.43,.04);group.add(caption);
  const enter=text(`Explorar · ${PORTAL_GAZE_TIME_LABEL}`,1.12,.16,spec.color);enter.position.set(0,-.72,.05);group.add(enter);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.10,1.18,.10,48),metal);base.position.y=-1.55;group.add(base);
  const stripe=new THREE.Mesh(new THREE.TorusGeometry(.98,.012,6,64),new THREE.MeshBasicMaterial({color:spec.color}));stripe.rotation.x=Math.PI/2;stripe.position.y=-1.49;group.add(stripe);
  const target=new THREE.Mesh(new THREE.PlaneGeometry(1.69,1.25),proxyMaterial);target.position.copy(picture.position);target.position.z=.06;group.add(target);
  const activate=()=>{portal.pulse=performance.now();navigate(spec.id);};
  const portal={spec,group,target,rim,inner,pulse:-Infinity};portals.push(portal);
  for(const mesh of [target,title,caption,enter]){mesh.userData.dwellDuration=PORTAL_GAZE_DURATION;mesh.userData.portal=spec.id;mesh.userData.activate=activate;targets.push(mesh);}
  portal.effects=portalEffects(group,i,assets);
  // Small real 3D emblems: chemistry, synchronized waves, and orbital geometry.
  const emblem=new THREE.Group();emblem.position.set(0,-1.11,.11);group.add(emblem);portal.emblem=emblem;
  if(i===0){
   const element=text('84 · Po',.38,.24,spec.color);emblem.add(element);
   for(const x of [-.43,.43]){const glass=new THREE.Mesh(new THREE.LatheGeometry([[0,.13],[.04,.14],[.20,.05],[.30,.05]].map(([y,r])=>new THREE.Vector2(r,y)),20),new THREE.MeshPhysicalMaterial({color:'#70daca',transparent:true,opacity:.55,metalness:.1,roughness:.1,side:THREE.DoubleSide,depthWrite:false}));glass.position.set(x,-.15,0);emblem.add(glass);const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.07,.11,.08,20),new THREE.MeshBasicMaterial({color:'#398a83'}));liquid.position.set(x,-.09,0);emblem.add(liquid);}
  }else if(i===1){for(let j=0;j<3;j++){const points=Array.from({length:65},(_,n)=>point((n/64-.5)*1.15,Math.sin(n/64*Math.PI*5)*.055+(j-1)*.11,.02));emblem.add(line(points,spec.color));}}
  else{const globe=new THREE.Mesh(new THREE.SphereGeometry(.13,20,14),new THREE.MeshStandardMaterial({color:'#399ed4',metalness:.4,roughness:.5}));emblem.add(globe);for(const angle of [-.6,.6]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.26,.008,6,48),new THREE.MeshBasicMaterial({color:angle<0?spec.color:'#e7be74'}));ring.rotation.set(.5,angle,.2);emblem.add(ring);}}
 }
 status('Lobby pronto. Escolha um portal pelo olhar.');
 return{root,portals,setQuality(v){for(const p of portals)p.effects.setQuality(v);starfield.geometry.setDrawRange(0,v>=2?750:v>=1.5?500:300);},animate(time,active,focus,progress=0){for(const p of portals){const selected=focus?.userData.portal===p.spec.id,pulse=THREE.MathUtils.clamp(1-(time-p.pulse)/450,0,1);p.effects.animate(time,selected,progress);p.rim.material.opacity=.55+p.effects.focus*.30+pulse*.1;p.inner.material.opacity=.10+p.effects.focus*.10+pulse*.12;p.emblem.rotation.y=p.spec.id==='katherine-johnson'?Math.sin(time*.00022)*.25:0;}}};
}
